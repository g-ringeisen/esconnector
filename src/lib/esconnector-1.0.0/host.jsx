
// Common
var CSIF_VERSION = "1.0.0";

if(!lib || !lib.external) {
	var lib = {
		external: new ExternalObject("lib:\PlugPlugExternalObject")
	};
}

// Load CSIF only if not already loaded
if(!csif || csif.version != "0") {

	// Release existing csif
	if(csif && csif.release)
		csif.release();

	var csif = { version: CSIF_VERSION };

	/**
	 * EVENT MANAGEMENT
	 */
	csif.dispatchEvent = function(type, data) {

		if(typeof data === 'object') {
			try {
				data = JSON.stringify(data);
			} catch(e) {
				data = "[Error: " + e.toString() + "]";
			}
		}

		if(!data)
			data = "";
	
		var event  = new CSXSEvent();
		event.type = type;
		event.data = data;
		event.dispatch();
	}
		
	csif.info = function(message) {
		csif.dispatchEvent("csif.log.info", message);
	}
		
	csif.error = function(message) {
		csif.dispatchEvent("csif.log.error", message);
	}
		
	csif.warning = function(message) {
		csif.dispatchEvent("csif.log.warning", message);
	}
		
	csif.debug = function(message) {
		csif.dispatchEvent("csif.log.debug", message);
	}

	/**
	 * Helpers
	 */
	

	csif.selectedLinks = function(doc) {
		var links     = [];
		var pageItems = doc.selectedPageItems;
		while(pageItems.length > 0) {
			var pageItem = pageItems.pop();
			if(pageItem.hasOwnProperty('pageItems') && pageItem.pageItems.length > 0) {
				for(var i=0; i<pageItem.pageItems.length; i++) {
					pageItems.push(pageItem.pageItems[i]);
				}
			}
			if(pageItem.hasOwnProperty('itemLink')) {
				links.push(pageItem.itemLink);
			}
		}
		return links;
	}

	csif.documentInfo = function(doc) {
		return csif.getDocumentInfo(doc);
	}

	/**
	 * Create a new Document
	 */
	csif.newDocument = function() {
		var doc = app.documents.add();
		return csif.documentInfo(doc);
	}

	/**
	 * Open the document at filepath
	 */
	csif.openDocument = function( filepath ) {
		var file = File(filepath);
		var doc  = app.open(file);
		return csif.documentInfo(doc);
	}

	/**
	 * Close the active document 
	 */
	csif.closeDocument = function(id, save) {
		var doc = csif.getDocumentById(id)
		doc.close(save ? SaveOptions.SAVECHANGES : SaveOptions.DONOTSAVECHANGES);
		return csif.documentInfo(doc);
	}

	csif.getSelection = function() {
		var list = [];
		var selection = app.selection;
		for(var i=0; i<selection.length; i++) {
			var item = selection[i];
			list.push({
				objectType: item.reflect.name,
				objectId: item.hasOwnProperty('id') ? item.id : null
			});
		}
		return list;
	}

	// To Support Drag'n Drop
	//replaceImageString("{image:5000001}", "raster", "C:/Users/Avenser/AppData/Roaming/Adobe/CEP/extensions/DragAndDrop/resources/jpg_example_1.jpg");
	csif.replaceImageString = function(id, targetCode, imageType, src){
		var doc = csif.getDocumentById(id);
		if(!doc)
			return;
		for(var lIndex=0; lIndex< doc.layers.length; lIndex++){
			var cLayer = doc.layers[lIndex];
			for(var i=0; i< cLayer.textFrames.length; i++){
				var tFr = cLayer.textFrames[i];
				if(tFr.contents == targetCode){
					var x = tFr.left;
					var y = tFr.top;
					
					if(imageType == "raster"){
						var rasterFile = File(src);
						var newPlacedItem = doc.placedItems.add();
						newPlacedItem.file = rasterFile;
						newPlacedItem.position = Array( x, y );
						newPlacedItem.embed();
					}
					if(imageType == "vector"){
						var embedDoc = new File(src);
						var placed = doc.groupItems.createFromFile( embedDoc );
					}
					
					tFr.remove();
					return;
				}
			}
		}
	}


	/**
	 * INDESIGN
	 */
	if(app.name == "Adobe InDesign") {

		function _getLinkPath(link) {
			var path = null;
			try {
				var uri = link.linkResourceURI;
				if(uri && uri.length > 5 && uri.substring(0,5) == "file:")
					path = decodeURIComponent(uri.substring(5));
			} catch(e) {
				csif.error(e);
			}
			return path;
		}

		csif.dispatchApplicationEvent = function(event) {
			var appEvent = {
				eventType: event.eventType,
			}
			
			if(appEvent.eventType == "afterSelectionChanged") {
				var doc = csif.getActiveDocument();
				if(doc != null) {
					var links = csif.selectedLinks(doc);
					var ids   = [];
					for(var i=0; i<links.length; i++)
						ids.push(links[i].id);
					appEvent.sourceObject = doc.reflect.name;
					appEvent.sourceId     = doc.id;
					appEvent.eventData    = ids;
				} else {
					appEvent.sourceObject = event.target.reflect.name,
					appEvent.sourceId     = event.target.hasOwnProperty('id') ? event.target.id : null
					appEvent.eventData    = [];
				}
			} else {
				appEvent.sourceObject = event.target.reflect.name,
				appEvent.sourceId     = event.target.hasOwnProperty('id') ? event.target.id : null
			}

			csif.dispatchEvent("csif.app.event", appEvent);
		}

		csif.init = function() {
			app.addEventListener(Application.AFTER_SELECTION_CHANGED, csif.dispatchApplicationEvent);
			app.addEventListener(Document.AFTER_ACTIVATE,             csif.dispatchApplicationEvent);
			app.addEventListener(Document.BEFORE_DEACTIVATE,          csif.dispatchApplicationEvent);
			app.addEventListener(Document.AFTER_LINKS_CHANGED,        csif.dispatchApplicationEvent);
			app.addEventListener(Link.AFTER_UPDATE,                   csif.dispatchApplicationEvent);
		}

		csif.release = function() {
			app.removeEventListener(Application.AFTER_SELECTION_CHANGED, csif.dispatchApplicationEvent);
			app.removeEventListener(Document.AFTER_ACTIVATE,             csif.dispatchApplicationEvent);
			app.removeEventListener(Document.BEFORE_DEACTIVATE,          csif.dispatchApplicationEvent);
			app.removeEventListener(Document.AFTER_LINKS_CHANGED,        csif.dispatchApplicationEvent);
			app.removeEventListener(Link.AFTER_UPDATE,                   csif.dispatchApplicationEvent);
		}

		csif.getActiveDocument = function() {
			try {
				return app.activeDocument;
			} catch(e) {
				return null;
			}
		}

		csif.getAllLinkedFiles = function() {
			var files = [];
			for(var i=0; i<app.documents.length; i++) {
				var doc = app.documents[i];
				if(doc.saved)
					files.push(doc.fullName.fsName);
				for(var j=0; j<doc.links.length; j++) {
					var link = doc.links[j];
					var path = _getLinkPath(link);
					if(path)
						files.push(path);
				}
			}
			return files;
		}

		csif.getDocumentById = function(id) {
			var doc = app.documents.itemByID(id);
			if(!doc)
				throw "Document not found: " + id;
			return doc;
		}

		csif.getDocumentInfo = function(doc) {
			if(typeof doc == "number" || doc instanceof Number)
				doc = csif.getDocumentById(doc);
			if(!doc)
				doc = csif.getActiveDocument();
			if(!doc || !(doc instanceof Document) || doc.isValid === false)
				return {};
			
			var info = {
				id: doc.id,
				name: doc.name,
				path: (doc.saved ? doc.fullName.fsName : null),
				modified: doc.modified,
				links: csif.getDocumentLinks(doc)
			};
			return info;
		}

		csif.getDocumentLinks = function(doc) {
			
			var list = [];
			var links = doc.links;
			var selectedLinks = csif.selectedLinks(doc);
			var pageLinkMap = {};

			// Retreive Links pages
			var items = doc.allPageItems;
			for(var i=0; i < items.length; i++) {
				var item = items[i];
				if(item.hasOwnProperty('itemLink')) {
					var page = item.parentPage;
					pageLinkMap[item.itemLink.id] = page ? page.name : "PB";
				}
			}
			
			for (var i=0; i<links.length; i++) {
				
				var link = links[i];
				var selected = false;
	
				for(var j=0; j<selectedLinks.length && !selected; j++)
					if(link == selectedLinks[j])
						selected = true;
	
				var metadata = JSON.parse(link.extractLabel("metadata") || "{}");
				metadata.id        = link.id;
				metadata.index     = link.index;
				metadata.name      = link.name;
				metadata.selected  = selected;
				metadata.embedded  = (!link.needed);
				metadata.missing   = link.status == LinkStatus.LINK_MISSING;
				metadata.page      = pageLinkMap[link.id];
				metadata.size      = link.size;
				metadata.path      = _getLinkPath(link);
				metadata.thumbnail = link.extractLabel("thumbnail");
	
				list.push(metadata);
			}
			return list;
		}

		csif.openDocument = function( filepath ) {
			var file = File(filepath);
			var doc  = app.open(file);
			try {
				if(!doc.saved && doc.converted)
					doc.save(file);
			} catch(e) {
				csif.error(e);
			}
			return csif.documentInfo(doc);
		}

		csif.saveDocument = function(id, filepath) {
			var doc = csif.getDocumentById(id);
			if(filepath) {
				var file = File(filepath);
				doc.save(file);	
			} else {
				doc.save();
			}
			return csif.documentInfo(doc);
		}

		csif.placeLink = function(docId, properties) {
			var doc  = csif.getDocumentById(docId);
			if(doc) {
				var file = new File(properties["path"]);
				delete properties["path"];

				doc.placeGuns.loadPlaceGun(file);
				linkId = doc.links[doc.links.length - 1].id;
				csif.updateLink(doc.id, linkId, properties);
				return linkId;
			}
		}

		csif.updateLink = function(docId, linkId, properties) {
			var doc  = csif.getDocumentById(docId);
			if(doc) {
				var link = doc.links.itemByID(linkId);
				if(link) {
					var file = null;
					if(properties.hasOwnProperty("path")) {
						file = new File(properties["path"]);
						delete properties["path"];
					}
					if(properties.hasOwnProperty("thumbnail")) {
						link.insertLabel("thumbnail", properties["thumbnail"] || "");
						delete properties["thumbnail"];
					}
					var metadata = JSON.parse(link.extractLabel("metadata") || "{}");
					for(var key in properties)
						metadata[key] = properties[key];
					link.insertLabel("metadata", JSON.stringify(metadata));
					
					if(file) {
						link.relink(file);
					} else {
						csif.dispatchEvent("csif.app.event", {
							eventType: Document.AFTER_LINKS_CHANGED,
							sourceObject: "Document",
							sourceId: docId
						});
					}
				}
			}
		}

		csif.showLink = function(docId, linkId) {
			var doc  = this.getDocumentById(docId);
			if(doc) {
				var items = doc.allPageItems;
				for(var i=0; i < items.length; i++) {
					var item = items[i];
					if(item.hasOwnProperty('itemLink')) {
						if(item.itemLink && item.itemLink.id == linkId) {
							item.select();
							break;
						}
					}
				}
			}
		}

		csif.getPDFExportPresets = function() {
			var names   = [];
			var presets = app.pdfExportPresets;
			for(var i=0; i<presets.length; i++) {
				names.push(presets[i].name);
			}
			return names;
		}

		csif.exportPDF = function(id, filepath, preset) {
			var doc  = csif.getDocumentById(id);
			var file = File(filepath);

			if(typeof preset == 'string')
				preset = app.pdfExportPresets.itemByName(preset);

			if(!preset || !preset.isValid) {
				doc.exportFile(ExportFormat.pdfType, file, true);
			} else {
				doc.exportFile(ExportFormat.pdfType, file, false, preset);
			}
		}
	}

	/**
	 * ILLUSTRATOR
	 */

	if(app.name == "Adobe Illustrator") {
		
		csif.init = function() {
			if(!app.nextUUID)
				app.nextUUID = 1;
		}

		csif.extractTag = function(obj, name, dflt) {
			try {
				return obj.tags.getByName(name).value || dflt;
			} catch(e) {
				return dflt || null;
			}
		}

		csif.insertTag = function(obj, name, value) {
			var tag = null;
			try {
				tag = obj.tags.getByName(name);
			} catch(e) {
				// ...
			}
			if(tag == null) {
				tag = obj.tags.add();
				tag.name = name;
			}
			tag.value = value;
		}

		csif.extractFile = function(obj) {
			try {
				return obj.file;
			} catch(e) {
				return {
					name: null,
					exists: false,
					length: null,
					fsName: null
				}
			}
		}

		csif.checkChanges = function() {
			var doc = csif.getActiveDocument();
			if(!doc)
				return;
			var docstate = {
				id: doc.id,
				uuids: [],
				files: [],
				selection: []
			};

			var documentChanged    = (!csif.docstate || csif.docstate.id != docstate.id);
			var selectionChanged   = false;
			var placedItemsChanged = false;

			
			for(var i=0; i<doc.placedItems.length; i++) {
				var item = doc.placedItems[i];
				docstate.uuids.push(item.uuid);
				docstate.files.push(csif.extractFile(item));
				docstate.selection.push(item.selected);

				if(!documentChanged) {
					if(csif.docstate.uuids[i] != docstate.uuids[i] || ("" + csif.docstate.files[i]) != ("" + docstate.files[i]))
						placedItemsChanged = true;
					if(csif.docstate.selection[i] != docstate.selection[i])
						selectionChanged = true;
				}
			}
			
			if(!documentChanged && !placedItemsChanged && csif.docstate.uuids.length != docstate.uuids.length)
				placedItemsChanged = true;

			if(documentChanged || placedItemsChanged || selectionChanged) {
				csif.docstate = docstate;
				if(placedItemsChanged) {
					csif.dispatchEvent("csif.app.event", {
						eventType: "afterLinksChanged",
						sourceObject: "Document",
						sourceId: csif.docstate.id
					});
				}

				if(selectionChanged) {
					var ids = [];
					for(var i=0; i<csif.docstate.selection.length; i++)
						if(csif.docstate.selection[i])
							ids.push(i);
					csif.dispatchEvent("csif.app.event", {
						eventType: "afterSelectionChanged",
						sourceObject: "Document",
						sourceId: csif.docstate.id,
						eventData: ids
					});
				}
			}
		}

		csif.getActiveDocument = function() {
			try {
				var doc = app.activeDocument;
				if(!doc.id) {
					for(var i=0; i<app.documents.length; i++) {
						if(app.documents[i] === doc) {
							doc.id = i;
							break;
						}
					}
				}
				return doc;
			} catch(e) {
				return null;
			}
		}
		
		csif.getAllLinkedFiles = function() {
			var files = [];
			for(var i=0; i<app.documents.length; i++) {
				var doc = app.documents[i];
				if(doc.fullName)
					files.push(doc.fullName.fsName);
				for(var j=0; j<doc.placedItems.length; j++) {
					var link = doc.placedItems[j];
					var file = csif.extractFile(link);
					if(file && file.fsName)
						files.push(file.fsName);
				}
			}
			return files;
		}

		csif.getDocumentById = function(docId) {
			for(var i=0; i<app.documents.length; i++) {
				if(app.documents[i].uuid == docId) {
					return app.documents[i];
				}
			}
			return null;
		}

		csif.getLinkById = function(doc, linkId) {
			if(typeof doc == "string" || typeof doc == "number" || doc instanceof Number)
				doc = csif.getDocumentById(doc);
			if(!doc)
				doc = csif.getActiveDocument();
			if(!doc || !(doc instanceof Document))
				return {};
			for(var i=0; i<doc.placedItems.length; i++) {
				if(doc.placedItems[i].uuid == linkId) {
					return doc.placedItems[i];
				}
			}
			return null;
		}

		csif.getDocumentInfo = function(doc) {
			if(typeof doc == "string" || typeof doc == "number" || doc instanceof Number)
				doc = csif.getDocumentById(doc);
			if(!doc)
				doc = csif.getActiveDocument();
			if(!doc || !(doc instanceof Document))
				return {};
			
			var info = {
				id: doc.uuid || (doc.uuid = app.nextUUID++), 
				name: doc.name,
				path: doc.fullName.fsName,
				modified: doc.modified,
				links: csif.getDocumentLinks(doc)
			};
			return info;
		}

		csif.getDocumentLinks = function(doc) {
			var links = [];
			for(var i=0; i<doc.placedItems.length; i++) {
				var link = doc.placedItems[i];
				var metadata = JSON.parse(csif.extractTag(link, "metadata", "{}"));
				var file = csif.extractFile(link);

				metadata.id        = link.uuid;
				metadata.index     = i;
				metadata.name      = link.name.length > 0 ? link.name : file.name || "<Linked File>";
				metadata.selected  = link.selected;
				metadata.embedded  = false;
				metadata.missing   = !file.exists;
				metadata.size      = file.length;
				metadata.path      = file.fsName;
				metadata.thumbnail = csif.extractTag(link, "thumbnail", null);
				links.push(metadata);
			}
			return links;
		}

		csif.saveDocument = function(id, filepath) {
			var doc = csif.getDocumentById(id);
			if(filepath) {
				var file = File(filepath);
				doc.saveAs(file); // Options ? 
			} else {
				doc.save();
			}
			return csif.documentInfo(doc);
		}

		csif.placeLink = function(docId, properties) {
			var doc  = csif.getDocumentById(docId);
			if(doc) {
				var file = new File(properties["path"]);
				delete properties["path"];

				var view       = doc.activeView;
				var viewWidth  = view.bounds[2] - view.bounds[0];
				var viewHeight = view.bounds[1] - view.bounds[3];
				var docWidth   = doc.cropBox[2] - doc.cropBox[0];
				var docHeight  = doc.cropBox[1] - doc.cropBox[3];
				var maxWidth   = (viewWidth > docWidth ? docWidth : viewWidth) * 0.7;
				var maxHeight  = (viewHeight > docHeight ? docHeight : viewHeight) * 0.7;

				if(doc.activeLayer)
					item = doc.activeLayer.placedItems.add();
				else
					item = doc.placedItems.add();
				
				item.file = file;
				//item.name = "P-1-15003-1_vaillant03.jpg";
				var itemWidth  = maxWidth;
				var itemHeight = item.height * itemWidth / item.width;
				if(itemHeight > maxHeight) {
					itemHeight = maxHeight;
					itemWidth  = item.width * itemHeight / item.height;
				}
				
				item.width  = itemWidth;
				item.height = itemHeight;
				item.left   = view.centerPoint[0] - itemWidth / 2;
				item.top    = view.centerPoint[1] + itemHeight / 2;

				csif.updateLink(doc.id, item.uuid, properties);
				return item.uuid;
			}
		}

		csif.updateLink = function(docId, linkId, properties) {
			var link = csif.getLinkById(docId, linkId);
			if(link) {
				var file = null;
				if(properties.hasOwnProperty("path")) {
					file = new File(properties["path"]);
					delete properties["path"];
				}
				if(properties.hasOwnProperty("thumbnail")) {
					csif.insertTag(link, "thumbnail", properties["thumbnail"]);
					delete properties["thumbnail"];
				}
				var metadata = JSON.parse(csif.extractTag(link, "metadata", "{}"));
				for(var key in properties)
					metadata[key] = properties[key];
				csif.insertTag(link, "metadata", JSON.stringify(metadata));

				if(file) {
					link.relink(file);
				} else {
					csif.dispatchEvent("csif.app.event", {
						eventType: "afterLinksChanged",
						sourceObject: "Document",
						sourceId: docId
					});
				}
			}
		}

		csif.getPDFExportPresets = function() {
			var names   = [];
			var presets = app.PDFPresetsList;
			for(var i=0; i<presets.length; i++) {
				names.push(presets[i]);
			}
			return names;
		}

		csif.exportPDF = function(id, filepath, preset) {
			var doc  = csif.getDocumentById(id);
			var curr = doc.fullName;
			var file = File(filepath);
			var opts = new PDFSaveOptions();
			if(preset)
				opts.PDFPreset = preset;
			opts.viewAfterSaving = false;
			doc.saveAs(file, opts);
			// Until we find a better solution
			doc.close();
			app.open(curr);
		}
	}

	/**
	 * PHOTOSHOP
	 */
	if(app.name == "Adobe Photoshop") {

		csif.init = function() {
			// ...
		}

		csif.getAllLinkedFiles = function() {
			return [];
		}

		csif.saveDocument = function(id, filepath) {
			var doc = csif.getDocumentById(id);
			if(filepath) {
				var file = File(filepath);
				doc.saveAs(file); // Options ?
			} else {
				doc.save();
			}
			return csif.documentInfo(doc);
		}

		csif.exportPDF = function(id, filepath) {
			var doc  = csif.getDocumentById(id);
			var file = File(filepath);
			//doc.exportFile(ExportFormat.pdfType, file, false);
			//doc.saveAs(file, PDFOptions);
		}

	}

	csif.init();
}
