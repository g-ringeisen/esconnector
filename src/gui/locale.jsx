cef.locale.define("C", {

	"appname": "DALIM ES Connector",
	"splashimage": "./gui/logincard.png",

	"connect": "Connect",
	"connecting": "Connecting...",
	"signin": "Sign in",
	"signout": "Sign out",
	"change": "Change",
	"rememberme": "Remember me",
	"username.label": "Account name",
	"password.label": "Password",
	"servername.label": "Server URL",
	"servername.helpertext": "Enter a repository URL or choose one in the history below",
	"servername.placeholder": "ex: www.your-dalim-es.com",
	"datasizes": ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb'],
	
	"selected": "selected",
	"local": "Local",
	"missing": "Missing",
	"unknown": "Unknown",
	"localcache": "Local cache",
	"fileconflict": "File changed locally and remotely",

	"Browser": "Browser",
	"Document": "Document",
	"Settings" : "Settings",

	"AssetID" : "Asset ID",
	"AssetName" : "Asset name",
	"AssetSize" : "Asset size",
	"AssetType" : "Asset type",
	"AssetPath" : "Asset path",
	"AssetVersion" : "Asset version",
	"Repository" : "Repository",
	"Location": "Location",
	"LockedBy" : "Locked by",
	"Rendition": "Rendition",
	"FileName": "File name",
	"FilePath": "File path",
	"FileSize": "File size",
	"LastModified": "Last modified",
	"DocumentLinks": "Document links",
	"Preferences": "Preferences",
	"Connection": "Connection",
	"Version": "Version",
	"Cache": "Cache",
	"AutoSave": "Auto save on upload",
	"UseHighResolution": "Use high resolution images",
	"PDFExportPreset": "PDF Export Preset",
	"Folder": "Folder",
	"Size": "Size",
	"Account": "Account",
	"Ok": "Ok",
	"Cancel": "Cancel",

	// Buttons and actions
	"uploadDocument": "Upload document",
	"checkAssetOut": "Check asset out",
	"checkDocumentIn": "Check document in",
	"exportDocumentAsPDF": "Export PDF",
	"uploadAllLocalLinks": "Upload all local links",
	"downloadAllMissingLinks": "Download all missing links",
	"placeAsset": "Place asset",
	"unlinkAsset": "Unlink asset",
	"linkNonHTTPAssets": "Link Non-HTTP assets",
	"downloadLink": "Download asset",
	"uploadLink": "Upload linked file",
	"checkLinkIn": "Check link in",
	"toggleRendition": "Toggle rendition",
	"setLinkHighres": "Set link Highres",
	"setLinkLowres": "Set link Lowres",
	"lockDocument": "Lock",
	"unlockDocument": "Unlock",
	"lockAsset": "Lock",
	"unlockAsset": "Unlock",
	"showAsset": "Show in repository",

	// States
	"downloading": "Downloading...",
	"uploading": "Uploading...",
	"exporting": "Exporting PDF...",
	"checkingout": "Checking out...",
	"checkingin": "Checking in...",
	"relinking": "Relinking...",

	// Alert messages
	"document_has_local_links": "Some assets in this document haven't been uploaded on a repository.\nIt is recommanded to upload all assets prior to the document.\n\nDo you still want to upload the document ?", 
	"document_uploaded": "Document '{0}' successfully uploaded",
	"document_checked_in": "Document '{0}' successfully checked in",
	"pdf_exported": "PDF '{0}' successfully exported",
	"{0}_asset_linked": "{0} asset linked",
	"{0}_assets_linked": "{0} assets linked",

	// Renditions
	"dalim:highresolution": "High Resolution",
	"dalim:highres": "High Resolution",
	"dalim:lowres": "Low Resolution",
	"dalim:preview": "Preview",
	"dalim:thumbnail": "Thumbnail",
	
	// File types
	"application/vnd.adobe.indesign": "Adobe InDesign",
	"application/vnd.adobe.indesign-idml-package": "IDML Package",
	"application/vnd.adobe.photoshop": "Adobe Photoshop",
	"application/illustrator": "Adobe Illustrator",
	"application/postscript": "Postscript",
	"text/plain": "Text",
	"video/quicktime": "QuickTime Video"
});

cef.locale.define("en", {
	
});

cef.locale.define("de", {
	
});

cef.locale.define("fr", {
	"connect": "Connecter",
	"connecting": "Connexion...",
	"signin": "Connecter",
	"signout": "Déconnecter",
	"change": "Changer",
	"rememberme": "Rester connecté",
	"username.label": "Identifiant",
	"password.label": "Mot de passe",
	"servername.label": "URL du serveur",
	"servername.helpertext": "Entrez une URL de serveur ou selectionnez en un ci-dessous",
	"datasizes": ['octets', 'Ko', 'Mo', 'Go', 'To', 'Po'],
	
	"selected": "sélectionné(s)",
	"local": "Local",
	"localcache": "Cache local",
	"missing": "Manquant",
	"unknown": "Inconnue",
	"fileconflict": "Fichiers modifié en local et sur le serveur",
	
	"Browser": "Navigateur",
	"Document": "Document",
	"Settings" : "Parametres",
	
	"AssetID" : "Identifiant",
	"AssetName" : "Nom",
	"AssetSize" : "Taille",
	"AssetType" : "Type",
	"AssetPath" : "Chemin",
	"AssetVersion" : "Version",
	"Repository" : "Repository",
	"Location": "Chemin",
	"LockedBy" : "Verrouillé",
	"Rendition": "Rendition",
	"FileName": "Fichier",
	"FilePath": "Emplacement",
	"FileSize": "Taille",
	"Version": "Version",
	"LastModified": "Modification",
	"DocumentLinks": "Fichiers liés",
	"Preferences": "Préférences",
	"Connection": "Connexion",
	"Cache": "Cache",
	"AutoSave": "Sauvegarder automatiquement",
	"UseHighResolution": "Utiliser les images en haute def.",
	"PDFExportPreset": "Preset d'export PDF",
	"Folder": "Répertoire",
	"Size": "Taille",
	"Account": "Compte",
	"Ok": "Ok",
	"Cancel": "Annuler",

	// Buttons and actions
	"uploadDocument": "Envoyer le document",
	"checkAssetOut": "Editer le document",
	"checkDocumentIn": "Redéposer le document",
	"exportDocumentAsPDF": "Exporter le PDF",
	"uploadAllLocalLinks": "Envoyer tous les fichiers locaux",
	"downloadAllMissingLinks": "Télécharger les fichiers manquants",
	"placeAsset": "Placer le fichier",
	"unlinkAsset": "Délier le fichier",
	"linkNonHTTPAssets": "Lier les fichiers non HTTP",
	"downloadLink": "Télécharger le fichier",
	"uploadLink": "Envoyer le fichier",
	"checkLinkIn": "Redéposer le fichier",
	"toggleRendition": "Changer la résolution",
	"setLinkHighres": "Mettre en haute def.",
	"setLinkLowres": "Mettre en basse def.",
	"lockDocument": "Verrouiller",
	"unlockDocument": "Déverrouiller",
	"lockAsset": "Verrouiller",
	"unlockAsset": "Déverrouiller",
	"showAsset": "Montrer dans la repository",

	// States
	"downloading": "Téléchargement...",
	"exporting": "Export PDF...",
	"uploading": "Envoie en cous...",
	"checkingout": "Récupération...",
	"checkingin": "Enregistrement...",
	"relinking": "Association...",

	// Alert messages
	"document_has_local_links": "Des fichiers liés au documents n'ont pas été enregistrés sur le serveur.\nIl est recommandé d'envoyer les fichiers liés sur le serveur avant le document.\n\nVoulez vous quand même envoyer ce document ?",
	"document_uploaded": "Document '{0}' envoyé",
	"document_checked_in": "Document '{0}' déposé",
	"pdf_exported": "PDF '{0}' exporté",
	"{0}_asset_linked": "{0} asset lié",
	"{0}_assets_linked": "{0} assets liés",

	// Renditions
	"dalim:highresolution": "Haute définition",
	"dalim:highres": "Haute définition",
	"dalim:lowres": "Basse définition",
	"dalim:preview": "Prévisualisation",
	"dalim:thumbnail": "Miniature",

	// File types
	"video/quicktime": "Vidéo QuickTime"
});

cef.locale.define("de", {
	
});