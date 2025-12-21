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

// --- BUILD STATIC LIST OF DOCUMENTS (CRITICAL) ---
var docsToExport = [];
for (var i = 0; i < app.documents.length; i++) {
    docsToExport.push(app.documents[i]);
}

// --- EXPORT DOCUMENTS ---
for (var j = 0; j < docsToExport.length; j++) {
    var doc = docsToExport[j];
    app.activeDocument = doc;

    // Convert to sRGB for smaller, consistent web files
    try {
        doc.convertProfile("sRGB IEC61966-2.1", Intent.PERCEPTUAL, true, true);
    } catch (e) {}

    // Base filename (resize.jsx creates names with no extension)
    var baseName = doc.name;
    var ext = "jpg";

    // FORCE UNIQUE FILENAMES (prevents overwrite)
    var saveFile = File(
        exportPath + "/" + baseName + "_" + (j + 1) + "." + ext
    );

    // JPEG COMPRESSION SETTINGS
    var jpgOpts = new JPEGSaveOptions();
    jpgOpts.quality = 8;              // 6–8 keeps under ~1.5MB
    jpgOpts.optimized = true;         // better compression
    jpgOpts.embedColorProfile = false;

    // SAVE
    doc.saveAs(saveFile, jpgOpts, true, Extension.LOWERCASE);

    if (!saveFile.exists) {
        alert("⚠ Failed to save:\n" + saveFile.fsName);
    }
}

// --- CLOSE ALL OPEN DOCUMENTS (NO SAVE) ---
while (app.documents.length > 0) {
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

alert("Export complete.\nAll documents have been closed.\n\nFiles saved to:\n" + exportPath);
