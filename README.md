# Linkedin Application Tracker

## *This application is just made for fun, not a fully developed extension. You are welcomed to use it as you wish.*

An extension to automatically log your LinkedIn job applications to a single spreadsheet. Track your applications with company name, position, location, and application date.

This is a simple extension I made to show how desperate it is to apply for jobs on LinkedIn, or maybe you just have fun collecting information about your life like me. Just for fun.

### YOU WILL SEE A WARNING AS **"Google hasn't verified this app"** IT IS EXPLAINED WHY YOU WILL ENCOUNTER THAT ERROR IN THE README.

### NEW UPDATE for BRAVE browser, if you use brave, get the branch "fix-auth-prompt" BUT
You gotta use your own google cloud project for this, actually killing all of the purpose to use it "easily" but I had to make changes because of the browser and had to use my own secret key in background.js, cannot share it lol.
Still works good in chrome. I believe it doesn't work in edge, but who cares.
---

### Quick Navigation

* [How can I set the extension??](#how-to-set-up)
* [I know how to set the extension but I do not know how to use it tho!!!](#so-how-to-use-that)
* [⚠️ Google's Warning ⚠️](#️-a-note-on-googles-warning)

---



# How to set up?

Just follow the steps down below. It's not rocket science.

### 1. Download the most useful extension you will ever have

1.  Click the green **`< > Code`** button on the top right.
2.  Click on **`Download ZIP`**.

<img width="1684" height="824" alt="h" src="https://github.com/user-attachments/assets/47caad66-253a-40c5-84c7-652e751c4c83" />

3.  Save the zip file anywhere you feel comfortable.

<img width="700" height="401" alt="h2" src="https://github.com/user-attachments/assets/2d28adec-cb55-4755-9843-48d75900a4dd" />

> **IMPORTANT:** DO NOT FORGET TO RIGHT-CLICK AND **`EXTRACT ALL`** THE ZIP FILE! OTHERWISE, YOU WON'T BE ABLE TO UPLOAD THE EXTENSION TO YOUR BROWSER!!!!

### 2. Upload the Extension in Chrome

4.  Open your Chrome browser and type `chrome://extensions` in the address bar and press Enter. **OR** simply click the puzzle icon on the right side of the search bar and click `Manage extensions`.

<img width="1494" height="284" alt="h3" src="https://github.com/user-attachments/assets/25e17304-7ede-4b4a-b5b9-e4e9ef1424cc" />

5.  Activate the **"Developer mode"** switch in the top-right corner.

    <img alt="Activating Developer Mode" src="https://github.com/user-attachments/assets/6e7202b1-146e-45a3-b269-629e96aadbe0" />

6.  Click the **`Load unpacked`** button that appears on the top left.

    <img alt="Load unpacked button" src="https://github.com/user-attachments/assets/ad668c16-2f07-4da0-90da-e4757d20d9b6" />

7.  On the file selection screen, select the **`linkedin-job-tracker-main`** folder you extracted in step 3 and press "Select Folder".

The installation is complete! You will see the extension icon in your browser's toolbar. You can now start using it.

---

# So how to use that?

<img alt="Extension icon in toolbar" src="https://github.com/user-attachments/assets/39168aa6-93a4-4da4-a6d0-ff5fac5af198" />

After you click the extension, you will see the popup shown below.

<img alt="Extension popup window" src="https://github.com/user-attachments/assets/ee0d9c19-928b-47a3-8753-3001aedd2950" />

For the first-time user, you need to go to the **`Settings`** page to make one of the biggest choices of your life.
Here in the settings, you can either choose to use my template as a prebuilt table for your comfort (I already designed the whole system on that table btw)...

<sub> *...or you can use your fancy table if you like* </sub> but I need to warn you, <ins>my table is already okay...</ins>

<img alt="Extension settings page" src="https://github.com/user-attachments/assets/1ed3c8a3-2452-4af2-9950-c9e2bf1c2484" />

If you choose wisely (I mean my template), the extension will ask for Google Drive permission. With that permission, you will have your own super-secret unemployment table. A copy of [this table](https://docs.google.com/spreadsheets/d/138_o2fC39qJjVmbRc4l2aYoFwpMKG4UbsQg2RLin7Yk/edit?usp=sharing) will be created in your own Drive as 'Restricted', and it will automatically open in a new tab.

<img alt="Google permission request" src="https://github.com/user-attachments/assets/a519b732-ab21-419d-b80c-453ac94b3137" />

After creating your new super-duper table for your unemployment journey, the extension will automatically save your spreadsheet to its memory. Now you are ready to go.

### ⚠️ A Note on Google's Warning

When you first try to create a spreadsheet, Google will show you a **"Google hasn't verified this app"** warning screen. **This is normal and expected.** 


<img width="1200" height="600" alt="q1" src="https://github.com/user-attachments/assets/e147e355-7dd8-4ffd-9346-5fe6d8951c90" />


### Why does this happen??? ISN'T THAT EXTENSION SAFE???
This extension is an independent project and is not published on the official Chrome Web Store. Because it asks for permission to access your Google Drive (to create the sheet), Google automatically shows this warning for any unverified application.

***You see this error because google ask you to verify your app and in order to verify your app you need to pay $5 and create a developer account.***

***I didn't want to pay $5 to create developer account to publish my extension in chrome's extension page, so google is not allowing me to verify that extension is safe.*** 

**How to safely proceed:**
1.  Click on **`Advanced`**.
2.  Click on **`Go to LinkedinScrapper (unsafe)`**.

<img width="700" height="800" alt="q3" src="https://github.com/user-attachments/assets/3608633d-d10e-4808-b86c-c68b43201db2" />

3. Then allow for the access.  

The extension only requests the minimum permissions required to create and write to your job tracking sheet. The code is fully open-source here on GitHub, so you can review it yourself to see that it's safe.

~And without $5 there is no way to prove your app is safe...~ ANYWAY.

---

Go to the best job application you can find to get rejected from on LinkedIn and click the extension. You will now see two buttons.

* **`Add to Sheet`**: Adds the Company Name, Position Name, Location, Today's Date, and "Application Sent" status to the spreadsheet.
* **`Open Tracking Sheet`**: Opens the spreadsheet you have created <sub> *(or your *different* spreadsheet which I know nothing about).* </sub>

<img alt="Using the extension on a job page" src="https://github.com/user-attachments/assets/220027e9-331a-46ff-9dcb-e28305d55a6a" />

At the end, you will have something like this. You can look at all of these companies and maybe have some bad thoughts, idk.

<img alt="Final spreadsheet view" src="https://github.com/user-attachments/assets/1e073930-6fad-49c7-b74d-2d3c0e0ce1e8" />

Columns F and G will be empty because I don't know when they will contact you. You can manually fill in column F. Then, if you want to calculate how long the company took to respond, you can simply use the formula `=F2-D2` and then propagate the formula down by double-clicking the cute little green dot on the bottom right of the cell.

And that's it. Have fun, I guess.

> **Note:** The table itself only has the Turkish version right now, and I am not willing to create a new English version, <sub>sorry.</sub>

---

### Contact

If you have anything to tell me, just write.

* **Email:** kubiulucay@gmail.com
* **LinkedIn:** [linkedin.com/in/kubilayulucay](https://www.linkedin.com/in/kubilayulucay/)
