1. Clone the repo
2. In "client" folder create a .env file and add "REACT_APP_API_BASE_URL="http://localhost:5000" or your URL whereever server is running
3. Search "google cloud console" and create a new project and enable "Google Sheets Api"

    `3.1. Navigate to credentials and there, Create a new service account and generate a key inside the service account`
    
    `3.2. Open the downlaoded key and copy the CLIENT_EMAIL and PRIVATE_KEY from there into your .env file in "Server" folder`

    `3.2. Create a new spreadsheeet from "sheets.google.com" and from the url find the ID for the spreadsheet and copy that aslo to your .env file in "Server" folder`

    `3.2. On your google spreadsheets find the share button and add the CLIENT_EMAIL you got and give it access to "edit the files"`

4. Run "npm install" to install the dependencies
5. "npm start" to run the server and client concurrently
6. Create an account in PlanetScale and generate the db url for prisma and paste it in .env file
7. npx prisma init
8. npm i @prisma/client
9. npx prisma generate 
//after above command perform this command to add prisma to your node modules
10. npx prisma db push 
//after every update in prisma schema update the db
//npx prisma migrate reset - this command is used to delete all data from your db
11. npx prisma studio 
//to view all your data inside prisma
12. Thanks!