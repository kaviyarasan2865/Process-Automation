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

This project is a proof of concept (PoC) for process automation. It allows users to automate email sending based on data in a spreadsheet. Here’s how to use it:

1. **User Login**: 
   - Users can log in to access the application.

2. **Select Spreadsheet**: 
   - Once logged in, users can select a spreadsheet from their Google Sheets account.

3. **Email Configuration**: 
   - Users can specify which column will be used for the following:
     - **Email Content**: The body of the email.
     - **To, CC, BCC**: Recipients of the email.
     - **Subject**: The subject line of the email.

4. **Send Email**: 
   - When you click the "Send Email" button, the application will send an email for the last row of data in the selected spreadsheet.

5. **Automated Email Sending**: 
   - By triggering the automation feature, the application will automatically send emails whenever new rows are added to the selected spreadsheet. This includes the ability to send emails for multiple rows added at once.

This feature streamlines communication and ensures that updates in the spreadsheet are promptly communicated via email.
