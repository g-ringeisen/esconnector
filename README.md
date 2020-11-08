# ES Connector

...
## Getting started

### Install on Mac

**Step 1** - Unzip the Archive or clone the repository

**Step 2** - Copy the `src` or `build/output` folder as `ESConnector` in the Adobe CEP folder.
<pre>
$ cd &lt;your project folder&gt;
$ cp -rp ./build/output "/Library/Application Support/Adobe/CEP/extensions/ESConnector"
</pre>

In a developpement environement, it is recommanded to create a softlink instead of copying the source so you test your changes immediately.
<pre>
$ ln -s "&lt;your project folder&gt;/src" "/Library/Application Support/Adobe/CEP/extensions/ESConnector"
</pre> 

**Step 3** - Enable the debug mode to run non signed extension. Depending on the version of Adobe CC you have, the command might differ.

For `Adobe CC 2019` and `2020`
<pre>
$ defaults write ~/Library/Preferences/com.adobe.CSXS.9.plist PlayerDebugMode 1
</pre>

For `Adobe CC 2021`
<pre>
$ defaults write ~/Library/Preferences/com.adobe.CSXS.10.plist PlayerDebugMode 1
</pre>

**Step 4** - Open either your `Adobe InDesign`, `Adobe Illustrator` or `Adobe Photoshop`, then go to the menu `Window > Extensions > DALIM ES`

### Install on Windows

**Step 1** - Unzip the Archive or clone the repository

**Step 2** - Copy the `src` or `build/output` folder as `ESConnector` in the Adobe CEP folder.
<pre>
Win(x86): C:\Program Files\Common Files\Adobe\CEP\extensions
Win(x64): C:\Program Files (x86)\Common Files\Adobe\CEP\extensions
</pre>

**Step 3** - Enable the debug mode to run non signed extension. Depending on the version of Adobe CC you have, the registry key might differ.

For `Adobe CC 2019` and `2020`
<pre>
regedit > HKEY_CURRENT_USER/Software/Adobe/CSXS.9
</pre>
For `Adobe CC 2021`
<pre>
regedit > HKEY_CURRENT_USER/Software/Adobe/CSXS.10
</pre>
Then add a new entry `PlayerDebugMode` of type `string` with the value of `1`.

## Controller

    cef.controller
	sd
...


#### `cef.controller.getActiveDocument()`
...
#### `cef.controller.getActiveDocumentLink()`
...
#### `cef.controller.getRepositoryName()`
...
#### `cef.controller.getAccountName()`
...
#### `cef.controller.getIndexURL()`
...
#### `cef.controller.getAsset(assetId, callback)`
...
#### `cef.controller.listAssets(assetId, callback)`
...
#### `cef.controller.searchAssets(query, callback)`
...
#### `cef.controller.checkAssetOut(assetId, callback)`
...
#### `cef.controller.cancelAssetCheckOut(assetId, callback)`
...
#### `cef.controller.checkAssetIn(assetId, data, callback)`
...	
#### `cef.controller.lockAsset(assetId, callback)`
...
#### `cef.controller.unlockAsset(assetId, callback)`
...
#### `cef.controller.newDocument(callback)`
...
#### `cef.controller.getPDFExportPresets(callback)`
...
#### `cef.controller.updateDocumentMetadata(callback)`
...
#### `cef.controller.downloadDocument(assetId, callback)`
...
#### `cef.controller.uploadDocument(path, callback)`
...
#### `cef.controller.checkDocumentOut(assetId, callback)`
...
#### `cef.controller.checkDocumentIn(callback)`
...
#### `cef.controller.downloadLink(linkId, callback)`
...
#### `cef.controller.uploadLink(linkId, path, callback)`
...
#### `cef.controller.checkLinkOut(linkId, callback)`
...
#### `cef.controller.checkLinkIn(linkId, callback)`
...
#### `cef.controller.linkNonHTTPAssets(folderId, callback)`
...
#### `cef.controller.linkAsset(linkId, assetId, callback)`
...
#### `cef.controller.unlinkAsset(linkId, callback)`
...	
#### `cef.controller.showLink(linkId, callback)`
...
#### `cef.controller.placeAsset(assetId, callback)`
...
#### `cef.controller.changeLinkRendition(linkId, rendition, callback)`
...
#### `cef.controller.exportPDF(path, callback)`
...
#### `cef.controller.getCacheFolder()`
...
#### `cef.controller.getCacheSize(callback)`
...
#### `cef.controller.clearCache(callback)`
...
#### `cef.controller.isSupportedDocumentType(type)`
...
#### `cef.controller.isSupportedLinkType(type)`
...