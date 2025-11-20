# HR to LR Lookbook Process Automation

This is a guide to automating the process which involves transferring High Resolution (HR) Lookbook photos to cropped, resized, <1.5MB images for the Low Resolution (LR) Lookbook. 

## **Crop / Resize & Export**

This section outlines the process of resizing all images from the HR Lookbook to the Hertrove site size standard (1281px x 1920px) in Adobe Photoshop, using a JavaScript file (**prep.jsx**) to automate the process.

### Step 1:

Download the **prep.jsx** file to your computer

### Step 2:

Open Adobe Photoshop.

Go to **File** > **Scripts** > **Other Script...** > select **prep.jsx**

Follow the instruction in window, using the hide tool to see each image, adjusting it to the frame if needed.

### Step 3:

Go to **File** > **Scripts** > **Other Script...** > select **export.jsx**

Follow the instruction in window, creating a file for the finalized images to be stored.

## **Resize**
Copy & paste the following code into your computer's terminal to ensure all images stay below 1.5 MB.

### Step 1:

Open your computer's terminal (**Applications** \> **Terminal**)

### Step 2:

Navigate to the folder in which you placed your new images.

### Step 3:
Copy and paste the following code into the terminal & hit enter 


**mkdir compressed**

  **for f in \*.jpg; do**

**magick convert "\$f" -define jpeg:extent=1500kb "compressed/\$f"**

**done**
