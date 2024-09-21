import { useState, useEffect, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { 
  Box, 
  Button, 
  VStack, 
  HStack, 
  Input, 
  Select, 
  Text, 
  Heading, 
  Divider, 
  useToast, 
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react';

export default function EmailWorkflow() {
  const [selectedStep, setSelectedStep] = useState('new-row');
  const [spreadsheetList, setSpreadsheetList] = useState([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState('');
  const [sheetList, setSheetList] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [googleSheetsToken, setGoogleSheetsToken] = useState(null);
  const [gmailToken, setGmailToken] = useState(null);
  const [lastUpdatedRow, setLastUpdatedRow] = useState(null);
  const [autoTrigger, setAutoTrigger] = useState(false);


  // Column mapping state
  const [toColumn, setToColumn] = useState('');
  const [ccColumn, setCcColumn] = useState('');
  const [bccColumn, setBccColumn] = useState('');
  const [subjectColumn, setSubjectColumn] = useState('');
  const [bodyColumn, setBodyColumn] = useState('');

  // Email preview state
  const [receivers, setReceivers] = useState([]);
  const [ccReceivers, setCcReceivers] = useState([]);
  const [bccReceivers, setBccReceivers] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [lastRowCount, setLastRowCount] = useState(0); 
  const toast = useToast();

  // Google Login for Sheets
  const googleSheetsLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleSheetsToken(tokenResponse.access_token);
      fetchSpreadsheets(tokenResponse.access_token);
    },
    onError: () => {
      toast({
        title: 'Google Sheets Login Failed.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
    scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets.readonly',
  });

  // Google Login for Gmail
  const gmailLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGmailToken(tokenResponse.access_token);
    },
    onError: () => {
      toast({
        title: 'Gmail Login Failed.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
    scope: 'https://www.googleapis.com/auth/gmail.send',
  });

  // Fetch user's spreadsheets
  const fetchSpreadsheets = async (token) => {
    try {
      const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: "mimeType='application/vnd.google-apps.spreadsheet'",
          fields: 'files(id, name)',
        },
      });
      setSpreadsheetList(response.data.files);
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
      toast({
        title: 'Error fetching spreadsheets.',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch sheets inside the selected spreadsheet
  const fetchSheets = async (spreadsheetId) => {
    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          headers: { Authorization: `Bearer ${googleSheetsToken}` },
        }
      );
      setSheetList(response.data.sheets.map((sheet) => sheet.properties));
    } catch (error) {
      console.error('Error fetching sheets:', error);
      toast({
        title: 'Error fetching sheets.',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Function to fetch the last updated row and populate email fields
  

// Fetch the last updated row and populate email fields
const fetchLastUpdatedRowAndPopulateFields = useCallback(async () => {
  if (!selectedSpreadsheet || !selectedSheet || !googleSheetsToken) {
    console.log('Not all required fields are set');
    return;
  }

  try {
    const response = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${selectedSpreadsheet}/values/${selectedSheet}!A:Z`,
      {
        headers: { Authorization: `Bearer ${googleSheetsToken}` },
      }
    );

    const rows = response.data.values;
    const currentRowCount = rows.length;

    // Check if there are new rows added
    if (currentRowCount > lastRowCount) {
      // Store newly added rows
      const newRows = rows.slice(lastRowCount, currentRowCount); // Get rows added since last check
      setLastRowCount(currentRowCount); // Update the row count

      // Loop through each new row to populate email fields and send emails
      for (const newRow of newRows) {
        const getColumnValue = (columnLetter) => {
          const columnIndex = columnLetter.charCodeAt(0) - 65; // Convert column letter to index (A=0, B=1, etc.)
          return newRow[columnIndex] || ''; // Return the cell value or an empty string if undefined
        };

        const lastRow = newRows[newRows.length - 1]; // Get the last new row

setReceivers(toColumn ? [getColumnValue(toColumn)] : []);
setCcReceivers(ccColumn ? [getColumnValue(ccColumn)] : []);
setBccReceivers(bccColumn ? [getColumnValue(bccColumn)] : []);
setSubject(subjectColumn ? getColumnValue(subjectColumn) : '');
setBody(bodyColumn ? getColumnValue(bodyColumn) : '');

        // Set email fields for the current row
        const currentReceivers = toColumn ? [getColumnValue(toColumn)] : [];
        const currentCcReceivers = ccColumn ? [getColumnValue(ccColumn)] : [];
        const currentBccReceivers = bccColumn ? [getColumnValue(bccColumn)] : [];
        const currentSubject = subjectColumn ? getColumnValue(subjectColumn) : '';
        const currentBody = bodyColumn ? getColumnValue(bodyColumn) : '';

        // Show a toast notification that data was fetched successfully
        toast({
          title: 'Data Fetched',
          description: `Email fields populated with new row data: ${JSON.stringify(newRow)}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        // Send email for the current row if autoTrigger is enabled
        if (autoTrigger) {
          await sendEmail(currentReceivers, currentCcReceivers, currentBccReceivers, currentSubject, currentBody);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching last updated row:', error);
    toast({
      title: 'Error fetching data',
      description: error.message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
}, [selectedSpreadsheet, selectedSheet, googleSheetsToken, toColumn, ccColumn, bccColumn, subjectColumn, bodyColumn, autoTrigger, lastRowCount]);

// Automatically fetch data at intervals when mapping is complete
useEffect(() => {
  if (toColumn && subjectColumn && bodyColumn) {
    const interval = setInterval(fetchLastUpdatedRowAndPopulateFields, 5000); // Poll every 5 seconds for new rows
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }
}, [toColumn, subjectColumn, bodyColumn, fetchLastUpdatedRowAndPopulateFields]);
  
  // Function to send email
  const sendEmail = async (currentReceivers, currentCcReceivers, currentBccReceivers, currentSubject, currentBody) => {
    if (!gmailToken) {
        toast({
            title: 'Gmail not connected',
            description: 'Please connect your Gmail account first.',
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    // Validate email addresses and subject/body
    if (currentReceivers.length === 0 || !currentSubject || !currentBody) {
        toast({
            title: 'Missing Information',
            description: 'Please make sure to fill in all required fields (To, Subject, Body).',
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        return;
    }

    // Prepare email headers
    const headers = [
        `To: ${currentReceivers.join(', ')}`,
        `Cc: ${currentCcReceivers.join(', ')}`,
        `Bcc: ${currentBccReceivers.join(', ')}`,
        `Subject: ${currentSubject}`,
        'Content-Type: text/plain; charset=UTF-8',
    ];

    // Combine headers and body
    const emailContent = headers.join('\n') + '\n\n' + currentBody;

    // Base64url encode the email content
    const encodedEmail = btoa(emailContent)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    try {
        await axios.post(
            'https://www.googleapis.com/gmail/v1/users/me/messages/send',
            { raw: encodedEmail },
            { headers: { Authorization: `Bearer ${gmailToken}` } }
        );

        toast({
            title: 'Email Sent',
            description: 'The email has been sent successfully.',
            status: 'success',
            duration: 3000,
            isClosable: true,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        const errorMessage = error.response?.data?.error?.message || 'An error occurred while sending the email.';
        toast({
            title: 'Error Sending Email',
            description: errorMessage,
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
    }
};

  // Generate options for column selection (A-Z)
  const columnOptions = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  // Render different step details based on selection
  const renderStepDetails = () => {
    if (selectedStep === 'new-row') {
      return (
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="medium">
              Connection *
            </Text>
            <HStack mt={2}>
              <Input value="google-sheets" isReadOnly />
              <Button colorScheme="blue" onClick={() => googleSheetsLogin()}>
                Connect
              </Button>
            </HStack>
          </Box>

          {spreadsheetList.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium">
                Select Spreadsheet *
              </Text>
              <Select
                placeholder="Select a Spreadsheet"
                value={selectedSpreadsheet}
                onChange={(e) => {
                  setSelectedSpreadsheet(e.target.value);
                  fetchSheets(e.target.value);
                }}
              >
                {spreadsheetList.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.name}
                  </option>
                ))}
              </Select>
            </Box>
          )}

          {sheetList.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="medium">
                Select Sheet *
              </Text>
              <Select
                placeholder="Select a Sheet"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
              >
                {sheetList.map((sheet) => (
                  <option key={sheet.sheetId} value={sheet.title}>
                    {sheet.title}
                  </option>
                ))}
              </Select>
            </Box>
          )}
        </VStack>
      );
    } else if (selectedStep === 'send-email') {
      return (
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="medium">
              Connection *
            </Text>
            <HStack mt={2}>
              <Input value="gmail" isReadOnly />
              <Button colorScheme="blue" onClick={() => gmailLogin()}>
                Connect
              </Button>
            </HStack>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium">To Column *</Text>
            <Select
              value={toColumn}
              onChange={(e) => setToColumn(e.target.value)}
              placeholder="Select To column"
            >
              {columnOptions.map((col) => (
                <option key={col} value={col}>
                  Column {col}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium">CC Column</Text>
            <Select
              value={ccColumn}
              onChange={(e) => setCcColumn(e.target.value)}
              placeholder="Select CC column"
            >
              {columnOptions.map((col) => (
                <option key={col} value={col}>
                  Column {col}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium">BCC Column</Text>
            <Select
              value={bccColumn}
              onChange={(e) => setBccColumn(e.target.value)}
              placeholder="Select BCC column"
            >
              {columnOptions.map((col) => (
                <option key={col} value={col}>
                  Column {col}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium">Subject Column *</Text>
            <Select
              value={subjectColumn}
              onChange={(e) => setSubjectColumn(e.target.value)}
              placeholder="Select Subject column"
            >
              {columnOptions.map((col) => (
                <option key={col} value={col}>
                  Column {col}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium">Body Column *</Text>
            <Select
              value={bodyColumn}
              onChange={(e) => setBodyColumn(e.target.value)}
              placeholder="Select Body column"
            >
              {columnOptions.map((col) => (
                <option key={col} value={col}>
                  Column {col}
                </option>
              ))}
            </Select>
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium">Preview</Text>
            <Text>To: {receivers.join(', ')}</Text>
            <Text>CC: {ccReceivers.join(', ')}</Text>
            <Text>BCC: {bccReceivers.join(', ')}</Text>
            <Text>Subject: {subject}</Text>
            <Text>Body: {body}</Text>
          </Box>

          <Button colorScheme="blue" onClick={() => sendEmail(receivers, ccReceivers, bccReceivers, subject, body)}>
  Send Email
</Button>


          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="auto-trigger" mb="0">
              Enable Auto-trigger
            </FormLabel>
            <Switch
              id="auto-trigger"
              isChecked={autoTrigger}
              onChange={(e) => setAutoTrigger(e.target.checked)}
            />
          </FormControl>
        </VStack>
      );
    }
  };

  return (
    <Box display="flex" height="100vh">
      {/* Left Section: Workflow Steps */}
      <Box flex="1" p={4} overflowY="auto" bg="gray.100">
      <Button
  mb={4}
  colorScheme="purple"
  onClick={fetchLastUpdatedRowAndPopulateFields}
>
  Test Flow
  <Text as="span" ml={2} fontSize="xs" color="gray.200">
    Ctrl + D
  </Text>
</Button>

        <VStack spacing={4} align="stretch">
          {/* Step 1: New Row Added */}
          <Box
            bg="white"
            p={4}
            rounded="md"
            boxShadow="md"
            border={selectedStep === 'new-row' ? '2px solid purple' : 'none'}
	    onClick={() => setSelectedStep('new-row')}
          >
            <HStack justifyContent="space-between">
              <HStack>
                <Box bg="green.500" w={6} h={6} rounded="full" color="white" display="flex" alignItems="center" justifyContent="center">
                  1
                </Box>
                <Text fontWeight="medium">New Row Added</Text>
              </HStack>
              <Text fontSize="sm" color="gray.500">...</Text>
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={2}>Google Sheets</Text>
          </Box>
          <Divider />
          {/* Step 2: Send Email */}
          <Box
            bg="white"
            p={4}
            rounded="md"
            boxShadow="md"
            border={selectedStep === 'send-email' ? '2px solid purple' : 'none'}
            onClick={() => setSelectedStep('send-email')}
          >
            <HStack justifyContent="space-between">
              <HStack>
                <Box bg="red.500" w={6} h={6} rounded="full" color="white" display="flex" alignItems="center" justifyContent="center">
                  2
                </Box>
                <Text fontWeight="medium">Send Email</Text>
              </HStack>
              <Text fontSize="sm" color="gray.500">...</Text>
            </HStack>
            <Text fontSize="xs" color="gray.500" mt={2}>Gmail</Text>
          </Box>
          <Divider />
          {/* End of Workflow */}
          <Text textAlign="center" fontSize="sm" color="gray.500">End</Text>
        </VStack>
      </Box>

      {/* Right Section: Step Details */}
      <Box w="400px" bg="white" p={4} boxShadow="lg" overflowY="auto">
        <Heading size="md" mb={4}>{selectedStep === 'new-row' ? 'New Row Added' : 'Send Email'}</Heading>
        {renderStepDetails()}
      </Box>
    </Box>
  );
}