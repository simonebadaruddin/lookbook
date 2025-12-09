# Note: Newly added files **resize.jsx** and **exportn.jsx** 
Use resize.jsx first, then exportn.jsx to resize and export without needing to rename










Transferring High Resolution Lookbook photos to cropped, resized, images under 1.5MB for the Low Resolution Lookbook using Adobe Photoshop. 

## **Crop, Resize & Export using Photoshop**

### Step 1:

Download **prep.jsx** & **export.jsx** files to your computer.

### Step 2:

Open Photoshop.

Go to **File** > **Scripts** > **Browse...** > select **prep.jsx**

Follow the instructions in the window.

### Step 3:

Go to **File** > **Scripts** > **Browse...** > select **export.jsx**

Follow the instructions in the window.


## **Keep Below Size Limit Using the Terminal**

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
