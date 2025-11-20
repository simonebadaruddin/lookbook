#target photoshop
app.bringToFront();

/*
export.jsx - Revised
Creates a parent folder chosen by user, creates subfolders for each item,
exports each non-background layer into the item's subfolder using the layer name.
*/

var jpegQuality = 12; // 0–12

if (!app.documents.length) {
    alert("No document open. Please open your preview document first.");
    throw new Error("No document open.");
}

var doc = app.activeDocument;

// Ask user where to save exported JPGs (parent folder)
var outputFolder = Folder.selectDialog("Select parent folder to save JPGs (a subfolder will be created for each item)");
if (!outputFolder) {
    alert("No folder selected. Exiting script.");
    throw new Error("No folder selected.");
}

// Optionally detect a background named "Background" and hide it during exports
var bgLayer = null;
for (var i = 0; i < doc.layers.length; i++) {
    if (doc.layers[i].name.toLowerCase() === "background") {
        bgLayer = doc.layers[i];
        bgLayer.visible = false;
        break;
    }
}

// Helper to extract item number from layer name
// Expecting names like: DESIGNER-SEASON-ITEM-... e.g., XX-SP24-12345-F or XX-SP24-12345-1
function extractItemFromName(name) {
    // split by '-' and take third element if available
    var parts = name.split('-');
    if (parts.length >= 3) {
        return parts[2];
    } else {
        return 'UNKNOWN';
    }
}

// Loop through layers and export each visible layer into its item's folder
// We'll iterate through doc.layers in order
for (var i = 0; i < doc.layers.length; i++) {
    var layer = doc.layers[i];

    // Skip background if present
    if (layer === bgLayer) continue;

    // Hide all layers first
    for (var j = 0; j < doc.layers.length; j++) doc.layers[j].visible = false;

    // Make this layer visible
    layer.visible = true;

    // Determine item folder name from layer.name
    var layerName = layer.name;
    var item = extractItemFromName(layerName);
    var itemFolder = new Folder(outputFolder + '/' + item);
    if (!itemFolder.exists) itemFolder.create();

    // Build file name and path
    var safeName = layerName.replace(/[\/\\:<>?"|*]/g, '_'); // sanitize
    var jpgFile = new File(itemFolder.fsName + '/' + safeName + '.jpg');

    // Prepare export options
    var jpgOptions = new ExportOptionsSaveForWeb();
    jpgOptions.format = SaveDocumentType.JPEG;
    jpgOptions.includeProfile = false;
    jpgOptions.interlaced = false;
    jpgOptions.optimized = true;
    jpgOptions.quality = jpegQuality;

    // Export
    try {
        doc.exportDocument(jpgFile, ExportType.SAVEFORWEB, jpgOptions);
    } catch (e) {
        alert('Error exporting layer "' + layerName + '": ' + e.message);
    }
}

// Re-show all layers (optional)
for (var k = 0; k < doc.layers.length; k++) doc.layers[k].visible = true;

// Optionally open parent folder
try { outputFolder.execute(); } catch (e) { /* ignore */ }

alert('All layers exported (organized by item) and parent folder opened.');
