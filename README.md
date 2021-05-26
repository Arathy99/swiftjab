![BFH Banner](https://trello-attachments.s3.amazonaws.com/542e9c6316504d5797afbfb9/542e9c6316504d5797afbfc1/39dee8d993841943b5723510ce663233/Frame_19.png)

# swiftJAB
*swiftJAB* is a discord bot which helps us to check vaccince slots available at a district or pincode basis and can send automatic notification whenever a slot opens up.

## Team members
1. Arathy J S[https://github.com/Arathy99]
2. Akshith S [https://github.com/AkshithS6063]
3. Preston Jose [https://github.com/preston-jose]

## Team Id
 BFH/recYzguq1OGr1UQsx/2021

## Link to product walkthrough
https://www.loom.com/share/7ae590f1afa9480195329c62e96c5561

## Libraries used
axios - HTTP Requests
discord.js - Discord API
deta - Deta Database SDK
fuzzyset - Best possible string matching (used for getting district names from users)
node-schedule - Notify users


## How to configure
Step 1

    git clone https://github.com/preston-jose/swiftjab.git
Step 2: Set environment variables for TOKEN (discord bot token) and DETA (deta detabase api key) 

    TOKEN='your_discord_bot_token_here'
Step 3

    npm install

Step 4

    npm start 
    
Alternatively you can use PM2 process manager to run the Node process in the background instead of Step 4

    pm2 start npm -- start
## How to Run
Instructions for running

To register:

    $jab register {age} -pin {pincode} -dose {1/2} {vax_name} 
    $jab register {age} -dis {district} -dose {1/2} {vax_name}

To check the slots:

    $jab slots -p {pincode} {date}
    $jab slots -d {district} {date}

To modify the data:

    $jab modify -age {age}
    $jab modify -pin {pincode}
    $jab modify -dis {district}
    $jab modify -dose {dose_no}
    $jab modify -vax {vax_name}

To notify:

    $jab notify h       //Hourly updates
    $jab notify hh      //Half Hourly updates
    $jab notify stop    //Unsubscribe to notifications
    
# Deployment
We have deployed at AWS Mumbai EC2 instance.