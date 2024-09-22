# Process Automation

This project aims to automate various processes using modern web technologies. Follow the installation instructions to set up the project locally.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

To set up the project locally, follow these steps:

1. Open Visual Studio Code (VS Code).
2. Open the terminal and navigate to the directory where you want to clone the repository.

3. Run the following commands:

   ```bash
   git clone https://github.com/kaviyarasan2865/Process-Automation
   cd Process-Automation
   npm install
   npm run dev

## Usage

This project is a proof of concept (PoC) for process automation, enabling users to streamline email communication based on spreadsheet data. Here’s how to use it:

1. **User Login**:
   - Users log in to the application to access their spreadsheets.

2. **Select Spreadsheet**:
   - After logging in, users can select the desired spreadsheet from their Google Sheets account.

3. **Email Configuration**:
   - Users must log in again separately to configure email settings. This includes selecting:
     - **Email Content Column**: The column used for the email body.
     - **Recipients**: Specify columns for "To," "CC," and "BCC."
     - **Subject**: Define the subject line for the emails.

4. **Send Email**:
   - Clicking the "Send Email" button will send an email for the last row of data in the selected spreadsheet.

5. **Automated Email Sending**:
   - By triggering the automation feature, emails will be sent automatically whenever new rows are added to the selected spreadsheet. This includes the ability to send emails for multiple rows added at once.

This functionality allows for efficient and timely communication based on updates in the spreadsheet.
