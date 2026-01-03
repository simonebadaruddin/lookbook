#target photoshop
app.bringToFront();

// ================= SETTINGS =================
var AB_W = 1281; // artboard width
var AB_H = 1920; // artboard height

// ================= SELECT FILES =================
var files = File.openDialog(
    "Select images",
    "Images: *.jpg; *.jpeg; *.png; *.tif; *.tiff",
    true
);
if (!files) throw new Error("No files selected");

// ================= HELPERS =================
function px(v) { return v.as("px"); }

// ================= CREATE DOCUMENT =================
var doc = app.documents.add(
    AB_W,
    AB_H,
    72,
    "Artboards_1281x1920",
    NewDocumentMode.RGB,
    DocumentFill.TRANSPARENT
);

// ================= CREATE ARTBOARD =================
function createArtboard(name) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putClass(stringIDToTypeID("artboardSection"));
    desc.putReference(charIDToTypeID("null"), ref);

    var rect = new ActionDescriptor();
    rect.putUnitDouble(charIDToTypeID("Left"), charIDToTypeID("#Pxl"), 0);
    rect.putUnitDouble(charIDToTypeID("Top "), charIDToTypeID("#Pxl"), 0);
    rect.putUnitDouble(charIDToTypeID("Rght"), charIDToTypeID("#Pxl"), AB_W);
    rect.putUnitDouble(charIDToTypeID("Btom"), charIDToTypeID("#Pxl"), AB_H);

    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("artboardSection"), rect);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);

    doc.activeLayer.name = name;
    return doc.activeLayer; // returns artboard group
}

// ================= PLACE IMAGE =================
function placeCoverImage(file, artboard) {
    // Open source image
    var src = app.open(file);
    src.selection.selectAll();
    src.selection.copy();
    src.close(SaveOptions.DONOTSAVECHANGES);

    app.activeDocument = doc;
    doc.paste();
    var layer = doc.activeLayer;

    // Move layer into artboard group first
    layer.move(artboard, ElementPlacement.INSIDE);

    // --- SCALE TO COVER ---
    var b = layer.bounds;
    var imgW = px(b[2]) - px(b[0]);
    var imgH = px(b[3]) - px(b[1]);
    var scale = Math.max(AB_W / imgW, AB_H / imgH) * 100;
    layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);

    // --- CENTER IN ARTBOARD ---
    // Use the artboard group's bounds (reliable)
    var abBounds = artboard.bounds; // [left, top, right, bottom]
    var abCx = (px(abBounds[0]) + px(abBounds[2])) / 2;
    var abCy = (px(abBounds[1]) + px(abBounds[3])) / 2;

    var layerBounds = layer.bounds;
    var layerCx = (px(layerBounds[0]) + px(layerBounds[2])) / 2;
    var layerCy = (px(layerBounds[1]) + px(layerBounds[3])) / 2;

    layer.translate(abCx - layerCx, abCy - layerCy);
}


// ================= MAIN LOOP =================
for (var i = 0; i < files.length; i++) {
    var name = files[i].name.replace(/\.[^\.]+$/, "");
    var ab = createArtboard(name);     // create artboard for this image
    placeCoverImage(files[i], ab);     // place image centered
}

alert(
    "Make necessary adjustments before exporting."
);
