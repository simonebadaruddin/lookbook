# HR to LR Lookbook Process Automation

A guide to transferring High Resolution Lookbook photos to cropped, resized, <1.5MB images for the Low Resolution Lookbook using Adobe Photoshop. 

## **Crop, Resize & Export using Photoshop**

### Step 1:

Download the **prep.jsx** and **export.jsx** files to your computer.

### Step 2:

Open Photoshop.

Go to **File** > **Scripts** > **Other Script...** > select **prep.jsx**

Follow the instruction in the window, using the hide layer visibility icon to view each image, adjusting it to the artboard as needed.

### Step 3:

Go to **File** > **Scripts** > **Other Script...** > select **export.jsx**

Follow the instruction in the window, creating a file for the finalized images to be stored.

## **Keep Below Size Limit Using the Computer Terminal**
Copy & paste the following code into your computer's terminal to ensure all images stay below 1.5 MB.

### Step 1:

Open your computer's terminal (**Applications** \> **Terminal**)

### Step 2:

Navigate to the folder in which you placed your new images.

### Step 3:
Copy and paste the following code into the terminal & hit enter: 


     mkdir compressed

       for f in \*.jpg; do

     magick convert "\$f" -define jpeg:extent=1500kb "compressed/\$f"

     done
