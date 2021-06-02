cef.locale.define("C", {

	// Application name displayed on the Welcome Page
	"appname": "DALIM ES Connector",
	// Splash image displayed on the Welcome Page
	"splashimage": "./gui/logincard.png",

	// FlyOut Menu
	"menu.reload": "Reload",
	"menu.home": "Go Home",
	"menu.getsupport": "Get Support",
	"menu.about": "About DALIM SOFTWARE GmbH",
	"menu.getsupport.url": "https://www.dalim.com",
	"menu.about.url": "https://www.dalim.com",

	// Text in the Connect button
	"connect": "Connect",
	// Text replacement in the connect button when connecting
	"connecting": "Connecting...",
	// Text in the sign in button
	"signin": "Sign in",
	// Tooltip text for the signout icon (settings tab)
	"signout": "Sign out",
	// Tooltip text for the change repository icon (settings tab)
	"change": "Change",
	// Check box in the login page
	"rememberme": "Remember me",
	// Label for the Login field
	"username.label": "Account name",
	// Label for the Password field
	"password.label": "Password",
	// Label for the server name field
	"servername.label": "Server URL",
	// Helper text for the server name field
	"servername.helpertext": "Enter a repository URL or choose one in the history below",
	// Placeholder text for the server name field
	"servername.placeholder": "ex: www.your-dalim-es.com",

	// File size units
	"datasizes": ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb'],
	
	// Used zhen selecting multiple items in a list. Will display "14 selected"
	"selected": "selected",

	// Asset and links statuses
	"local": "Local",
	"missing": "Missing",
	"unknown": "Unknown",
	"localcache": "Local cache",
	"fileconflict": "File changed locally and remotely",

	// Main interface Tab names
	"Browser": "Browser",
	"Document": "Document",
	"Settings" : "Settings",

	// Asset and links property names (mainly displayed in the expandable property panel)
	"AssetID" : "Asset ID",
	"AssetName" : "Asset name",
	"AssetSize" : "Asset size",
	"AssetType" : "Asset type",
	"AssetPath" : "Asset path",
	"AssetVersion" : "Asset version",
	"Repository" : "Repository",
	"AssetPath": "Asset path",
	"LockedBy" : "Locked by",
	"Rendition": "Rendition",
	"FileName": "File name",
	"FilePath": "File path",
	"FileSize": "File size",
	"LastModified": "Last modified",
	"Version": "Version",
	
	// Document link list title
	"DocumentLinks": "Document links",

	// Heading text for user preferences displayed in the settings tab
	"Preferences": "Preferences",
	// Heading text for the connection information displayed in the settings tab
	"Connection": "Connection",
	// Heading text for the cache information displayed in the settings tab
	"Cache": "Cache",

	// Some preferences and settings name
	"AutoSave": "Auto save on upload",
	"UseHighResolution": "Use high resolution images",
	"PDFExportPreset": "PDF Export Preset",
	"Account": "Account",
	"Folder": "Folder",
	"Size": "Size",
	
	// OK action
	"Ok": "Ok",
	// Cancel action
	"Cancel": "Cancel",

	// Tootips on action buttons
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

	// Asset and files states (displayed beside the asset while performing the action)
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
	"application/rdf+xml": "Adobe Photoshop",
	"application/illustrator": "Adobe Illustrator",
	"application/postscript": "Postscript",
	"text/plain": "Text",
	"video/quicktime": "QuickTime Video",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word document",
	"tiff/it": "TIFF-IT"
});

cef.locale.define("en", {
	
});

cef.locale.define("de", {

	"appname": "DALIM ES Steckverbinder",
    "splashimage": "./gui/logincard.png",
    "connect": "Verbinden",
    "connecting": "Verbindung...",
    "signin": "Anmeldung",
    "signout": "Abmeldung",
    "change": "Ändern",
    "rememberme": "Login speichern",
    "username.label": "Kontoname",
    "password.label": "Kennwort",
    "servername.label": "Server URL",
    "servername.helpertext": "Geben Sie eine Repository-URL ein oder wählen Sie eine in der nachstehenden Historie",
    "servername.placeholder": "Beispiel: www.your-dalim-es.com",
    "datasizes": ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb'],
    
    // Used zhen selecting multiple items in a list. Will display "14 selected"
    "selected": "ausgewählt",

    // Asset and links statuses
    "local": "Lokal",
    "missing": "Fehlend",
    "unknown": "Unbekannt",
    "localcache": "Lokaler Cache",
    "fileconflict": "Datei lokal und entfernt geändert",

    // Main interface Tab names
    "Browser": "Browser",
    "Document": "Dokument",
    "Settings" : "Einstellungen",

    // Asset and links property names (mainly displayed in the expandable property panel)
    "AssetID" : "Asset ID",
    "AssetName" : "Assetname",
    "AssetSize" : "Assetgröße",
    "AssetType" : "Assettyp",
    "AssetPath" : "Assetpfad",
    "AssetVersion" : "Assetversion",
    "Repository" : "Repository",
    "Location": "Lage",
    "LockedBy" : "Gesperrt durch",
    "Rendition": "Wiedergabe",
    "FileName": "Dateiname",
    "FilePath": "Dateipfad",
    "FileSize": "Dateigröße",
    "LastModified": "Zuletzt geändert",
    "Version": "Version",
    
    // Document link list title
    "DocumentLinks": "Dokumentverknüpfungen",

    // Heading text for user preferences displayed in the settings tab
    "Preferences": "Präferenzen",
    "Connection": "Verbindung",
    "Cache": "Cache",

    // Some preferences and settings name
    "AutoSave": "Automatisches Speichern beim Hochladen",
    "UseHighResolution": "Hochauflösende Bilder verwenden",
    "PDFExportPreset": "Voreinstellung für PDF-Export",
    "Account": "Konto",
    "Folder": "Ordner",
    "Size": "Größe",

	// Confirm buttons
    "Ok": "Ok",
    "Cancel": "Abbrechen",

    // Tootips on action buttons
    "uploadDocument": "Dokument hochladen",
    "checkAssetOut": "Asset auschecken",
    "checkDocumentIn": "Dokument einchecken",
    "exportDocumentAsPDF": "PDF exportieren",
    "uploadAllLocalLinks": "Alle lokalen Verbindungen hochladen",
    "downloadAllMissingLinks": "Alle fehlenden Verbindungen herunterladen",
    "placeAsset": "Asset platzieren",
    "unlinkAsset": "Asset lösen",
    "linkNonHTTPAssets": "Nicht-HTTP Assets verknüpfen",
    "downloadLink": "Asset herunterladen",
    "uploadLink": "Verknüpfte Datei hochladen",
    "checkLinkIn": "Verknüpfung einchecken",
    "toggleRendition": "Wiedergabe umschalten",
    "setLinkHighres": "Verknüpfung Highres setzen",
    "setLinkLowres": "Verknüpfung Lowres setzen",
    "lockDocument": "Sperren",
    "unlockDocument": "Entsperren",
    "lockAsset": "Sperren",
    "unlockAsset": "Entsperren",
    "showAsset": "Im Repository anzeigen",

    // Asset and files states (displayed beside the asset while performing the action)
    "downloading": "Herunterladung...",
    "uploading": "Hochladung...",
    "exporting": "PDF Export...",
    "checkingout": "Auscheckung...",
    "checkingin": "Eincheckung...",
    "relinking": "Neuverknüpfung...",

    // Alert messages
    "document_has_local_links": "Einige Assets in diesem Dokument wurden nicht auf ein Repository hochgeladen.\nEs wird empfohlen, alle Assets vor dem Dokument hochzuladen..\n\nWollen Sie das Dokument immer noch hochladen ?", 
    "document_uploaded": "Dokument '{0}' erfolgreich hochgeladen",
    "document_checked_in": "Dokument '{0}' erfolgreich eingecheckt",
    "pdf_exported": "PDF '{0}' erfolgreich exportiert",
    "{0}_asset_linked": "{0} Asset verknüpft",
    "{0}_assets_linked": "{0} Assets verknüpft",

    // Renditions
    "dalim:highresolution": "Hochauflösung",
    "dalim:highres": "Hochauflösung",
    "dalim:lowres": "Niedrige Auflösung",
    "dalim:preview": "Voransicht",
    "dalim:thumbnail": "Miniaturbild",
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
	"video/quicktime": "Vidéo QuickTime",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Document Word"
});
