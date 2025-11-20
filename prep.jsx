#target photoshop
app.bringToFront();

/*
prep.jsx - Revised
Prompts for designer initials, season, and a list of item numbers (multiline).
Places chosen images as embedded smart objects, lets user assign each layer to an item number,
initially names them <designer>-<season>-<itemnumber>-<index>,
then allows the user to label each image type (F/B/S/C/Other) and finalizes names.
*/

var targetWidth = 1281;
var targetHeight = 1980;

// --- Helper: ScriptUI multiline prompt for item numbers ---
function askDesignerSeasonAndItems() {
    var dlg = new Window('dialog', 'Designer, Season and Item Numbers');
    dlg.orientation = 'column';
    dlg.alignChildren = ['fill','top'];

    var grp1 = dlg.add('group');
    grp1.orientation = 'row';
    grp1.add('statictext', undefined, 'Designer initials:');
    var designerInput = grp1.add('edittext', undefined, '');
    designerInput.characters = 10;

    grp1.add('statictext', undefined, 'Season:');
    var seasonInput = grp1.add('edittext', undefined, '');
    seasonInput.characters = 10;

    dlg.add('statictext', undefined, 'Paste item numbers (one per line):');
    var itemsBox = dlg.add('edittext', undefined, '', {multiline: true, scrolling: true});
    itemsBox.minimumSize = [400,200];

    var btns = dlg.add('group');
    btns.alignment = 'right';
    var ok = btns.add('button', undefined, 'OK');
    var cancel = btns.add('button', undefined, 'Cancel');

    ok.onClick = function() {
        if (designerInput.text.trim() === '' || seasonInput.text.trim() === '') {
            alert('Please enter designer initials AND season.');
            return;
        }
        if (itemsBox.text.trim() === '') {
            alert('Please paste at least one item number.');
            return;
        }
        dlg.close(1);
    };
    cancel.onClick = function() { dlg.close(0); };

    var res = dlg.show();
    if (res !== 1) {
        return null;
    }

    // Parse item numbers: split by newlines, trim, remove empty lines
    var raw = itemsBox.text.replace(/\r/g, '\n');
    var lines = raw.split('\n');
    var items = [];
    for (var i = 0; i < lines.length; i++) {
        var s = lines[i].replace(/^\s+|\s+$/g, '');
        if (s !== '') items.push(s);
    }

    return {
        designer: designerInput.text.replace(/\s+/g, ''),
        season: seasonInput.text.replace(/\s+/g, ''),
        items: items
    };
}

// --- Helper: select a single item number from a list (dropdown) ---
function askSelectItemNumber(itemList, filename) {
    var dlg = new Window('dialog', 'Assign Item Number');
    dlg.orientation = 'column';
    dlg.alignChildren = ['fill','top'];
    dlg.add('statictext', undefined, 'File: ' + filename);
    dlg.add('statictext', undefined, 'Select the correct item number:');

    var dropdown = dlg.add('dropdownlist', undefined, itemList);
    dropdown.selection = 0;

    var btns = dlg.add('group');
    btns.alignment = 'right';
    var ok = btns.add('button', undefined, 'Assign');
    var skip = btns.add('button', undefined, 'Skip');
    var cancel = btns.add('button', undefined, 'Cancel');

    var result = null;
    ok.onClick = function() { result = dropdown.selection ? dropdown.selection.text : null; dlg.close(1); };
    skip.onClick = function() { result = '__SKIP__'; dlg.close(1); };
    cancel.onClick = function() { dlg.close(0); };

    var showRes = dlg.show();
    if (showRes !== 1) return null;
    return result;
}

// --- Helper: ask type label for an image (F/B/S/C/Other) ---
function askTypeForImage(layerName) {
    var dlg = new Window('dialog', 'Label Image Type');
    dlg.orientation = 'column';
    dlg.alignChildren = ['fill','top'];
    dlg.add('statictext', undefined, 'Layer: ' + layerName);
    dlg.add('statictext', undefined, 'Choose type (or "Other" to enter custom label):');

    var typeList = ['F', 'B', 'S', 'C', 'Other', 'Skip'];
    var dropdown = dlg.add('dropdownlist', undefined, typeList);
    dropdown.selection = 0;

    var custom = dlg.add('edittext', undefined, '');
    custom.visible = false;

    dropdown.onChange = function() {
        if (dropdown.selection.text === 'Other') custom.visible = true;
        else custom.visible = false;
    };

    var btns = dlg.add('group');
    btns.alignment = 'right';
    var ok = btns.add('button', undefined, 'OK');
    var cancel = btns.add('button', undefined, 'Cancel');

    ok.onClick = function() {
        var pick = dropdown.selection.text;
        if (pick === 'Other') {
            var txt = custom.text.replace(/^\s+|\s+$/g, '');
            if (txt === '') {
                alert('Please enter a custom label.');
                return;
            }
            result = txt;
        } else if (pick === 'Skip') {
            result = '__SKIP__';
        } else {
            result = pick;
        }
        dlg.close(1);
    };
    cancel.onClick = function() { dlg.close(0); };

    var result = null;
    var res = dlg.show();
    if (res !== 1) return null;
    return result;
}

// --- Place image as embedded smart object using Action Manager (same as original) ---
function placeImageToDocument(doc, file) {
    var idPlc = charIDToTypeID("Plc ");
    var desc = new ActionDescriptor();
    desc.putPath(charIDToTypeID("null"), file);
    desc.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));
    var offsetDesc = new ActionDescriptor();
    offsetDesc.putUnitDouble(charIDToTypeID("Hrzn"), charIDToTypeID("#Pxl"), 0);
    offsetDesc.putUnitDouble(charIDToTypeID("Vrtc"), charIDToTypeID("#Pxl"), 0);
    desc.putObject(charIDToTypeID("Ofst"), charIDToTypeID("Ofst"), offsetDesc);
    executeAction(idPlc, desc, DialogModes.NO);

    var layer = doc.activeLayer;
    return layer;
}

// --- Resize + center layer to fill canvas (may crop) ---
function resizeAndCenterLayer(layer) {
    var bounds = layer.bounds;
    var layerW = bounds[2].as('px') - bounds[0].as('px');
    var layerH = bounds[3].as('px') - bounds[1].as('px');

    // if width/height are zero (rare), skip scaling
    if (layerW === 0 || layerH === 0) return;

    var scaleFactor = Math.max(targetWidth / layerW, targetHeight / layerH) * 100;
    layer.resize(scaleFactor, scaleFactor);

    // recalc bounds then translate to center
    bounds = layer.bounds;
    var layerWnew = bounds[2].as('px') - bounds[0].as('px');
    var layerHnew = bounds[3].as('px') - bounds[1].as('px');

    // compute translation - layer.bounds are relative to document; translate expects pixels
    var tx = (targetWidth - layerWnew) / 2 - bounds[0].as('px');
    var ty = (targetHeight - layerHnew) / 2 - bounds[1].as('px');

    layer.translate(tx, ty);
}

// ----------------- MAIN -----------------
var info = askDesignerSeasonAndItems();
if (!info) {
    alert('Cancelled.');
    throw new Error('Cancelled by user.');
}

var designer = info.designer;
var season = info.season;
var itemList = info.items;

// Prompt user to select multiple images
var files = File.openDialog("Select your images", "Images:*.jpg;*.png;*.jpeg;*.tif;*.psd", true);
if (!files || files.length === 0) {
    alert("No files selected. Exiting script.");
    throw new Error("No files selected.");
}

// Create a single document to hold all images as layers
var doc = app.documents.add(targetWidth, targetHeight, 72, "Preview Images", NewDocumentMode.RGB, DocumentFill.WHITE);

// Data structures to track counts
var perItemCount = {}; // counts of images per item (for numeric suffixes)
for (var k = 0; k < itemList.length; k++) perItemCount[itemList[k]] = 0;

// Keep track of all placed layers in order
var placedLayers = [];

for (var i = 0; i < files.length; i++) {
    // Place file
    placeImageToDocument(doc, files[i]);
    var layer = doc.activeLayer;

    // Resize & center
    try { resizeAndCenterLayer(layer); } catch (e) { /* ignore resize errors */ }

    // Hide all other layers so user can see this one clearly
    for (var j = 0; j < doc.layers.length; j++) doc.layers[j].visible = false;
    layer.visible = true;

    // Ask user to select item number
    var selection = askSelectItemNumber(itemList, files[i].name);
    if (selection === null) {
        // cancelled
        alert('Operation cancelled. You may re-run the script.');
        throw new Error('User cancelled during assignment.');
    } else if (selection === '__SKIP__') {
        // leave unassigned but add to placedLayers with a placeholder assignment
        var tempName = designer + '-' + season + '-UNASSIGNED-' + (i+1);
        layer.name = tempName;
        placedLayers.push({ layer: layer, item: '__UNASSIGNED__' });
        continue;
    } else {
        var item = selection;
        // increment count for this item
        perItemCount[item] = (perItemCount[item] || 0) + 1;
        var idx = perItemCount[item];
        // create numeric suffix (no zero-pad)
        var newName = designer + '-' + season + '-' + item + '-' + idx;
        layer.name = newName;
        placedLayers.push({ layer: layer, item: item });
    }
}

// After assigning numeric names, now loop per item to ask for type labels
// Build mapping item -> array of layers (in doc order)
var itemToLayers = {};
for (var p = 0; p < placedLayers.length; p++) {
    var rec = placedLayers[p];
    if (rec.item === '__UNASSIGNED__') continue;
    if (!itemToLayers[rec.item]) itemToLayers[rec.item] = [];
    itemToLayers[rec.item].push(rec.layer);
}

// For each item, go through its layers and ask for type
for (var itemKey in itemToLayers) {
    if (!itemToLayers.hasOwnProperty(itemKey)) continue;
    var layersArray = itemToLayers[itemKey];

    // typeCounts tracks how many times a given type has been used for this item
    var typeCounts = {};

    for (var m = 0; m < layersArray.length; m++) {
        var L = layersArray[m];
        // show only this layer
        for (var a = 0; a < doc.layers.length; a++) doc.layers[a].visible = false;
        L.visible = true;

        var currentName = L.name;
        var chosen = askTypeForImage(currentName);
        if (chosen === null) {
            alert('Cancelled during type labeling. You may re-run the script to complete labeling.');
            throw new Error('Cancelled during type labeling.');
        } else if (chosen === '__SKIP__') {
            // leave the numeric name as-is
            continue;
        } else {
            var typeLabel = chosen.replace(/\s+/g, '');

            // increment count for this type
            typeCounts[typeLabel] = (typeCounts[typeLabel] || 0) + 1;
            var tcount = typeCounts[typeLabel];

            // Construct suffix: follow logic:
            // If only one instance so far (tcount==1) -> choose <type> (e.g., -F) or use -F1? We will:
            // If later more appear (tcount becomes 2), we will rename the first to -TYPE1 and current to -TYPE2.
            // For implementation simplicity:
            // If tcount==1 temporarily set to -TYPE (no number). If tcount>1, we retroactively rename previous ones.
            var basePrefix = designer + '-' + season + '-' + itemKey;

            if (tcount === 1) {
                // name candidate: basePrefix + '-' + typeLabel
                var newName = basePrefix + '-' + typeLabel;
                L.name = newName;
            } else {
                // If tcount >= 2, we need to rename previous ones to include numeric indices
                // Rename previous occurrences for this type in layersArray[0..m-1]
                var seen = 0;
                for (var q = 0; q < layersArray.length; q++) {
                    var LL = layersArray[q];
                    // check its current name ends with '-' + typeLabel or '-' + typeLabel + digits
                    var pattern = new RegExp(basePrefix + '-' + typeLabel + '(?:\\d*)$');
                    if (pattern.test(LL.name)) {
                        seen++;
                        // new name with index seen
                        LL.name = basePrefix + '-' + typeLabel + seen;
                    }
                }
                // now name current layer with the tcount index (which equals seen)
                L.name = basePrefix + '-' + typeLabel + tcount;
            }
        }
    }
}

// Final message
alert('All images placed and labeled. Please review layers and adjust if needed before exporting.');
