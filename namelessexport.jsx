#target photoshop
app.bringToFront();

// --- CHECK FOR OPEN DOCUMENTS ---
if (app.documents.length === 0) {
    alert("No open documents to export.");
    throw new Error("No open documents to export."); 
}

// --- CHOOSE EXPORT FOLDER ---
var exportFolder = Folder.selectDialog("Select or create an export folder:");
if (!exportFolder) {
    alert("Export cancelled — no folder selected.");
    throw new Error("Export cancelled — no folder selected.");
}

var exportPath = exportFolder.fsName;

// --- BUILD STATIC LIST OF DOCUMENTS ---
var docsToExport = [];
for (var i = 0; i < app.documents.length; i++) {
    docsToExport.push(app.documents[i]);
}

// --- EXPORT DOCUMENTS ---
for (var j = 0; j < docsToExport.length; j++) {
    var doc = docsToExport[j];

    // Make sure the document is active
    app.activeDocument = doc;

    // Get clean filename
    var rawName = doc.name;
    var dotIndex = rawName.lastIndexOf(".");
    var baseName = (dotIndex > -1) ? rawName.substring(0, dotIndex) : rawName;
    var ext = (dotIndex > -1) ? rawName.substring(dotIndex + 1).toLowerCase() : "jpg";

    if (ext === "jpeg") ext = "jpg";
    if (ext !== "jpg" && ext !== "png") ext = "jpg";

    var saveFile = File(exportPath + "/" + baseName + "." + ext);

    if (ext === "png") {
        var pngOpts = new PNGSaveOptions();
        pngOpts.interlaced = false;
        doc.saveAs(saveFile, pngOpts, true, Extension.LOWERCASE);
    } else { // JPG
        var jpgOpts = new JPEGSaveOptions();
        jpgOpts.quality = 12;
        doc.saveAs(saveFile, jpgOpts, true, Extension.LOWERCASE);
    }

    if (!saveFile.exists) {
        alert("⚠ Failed to save: " + saveFile.fsName);
    }
}

alert("All open documents exported to:\n" + exportPath);
