# ES Connector

...
# Getting started

## Install from Adobe Exchange

Comming soon...

## Manual installation

**Step 1** - Unzip the archive `ESConnector_install.zip`

**Step 2** - Run the installer for your plateform

* Mac OS:	`install_mac`
* Windows:	`install_win.bah`

## User interface

Open either your `Adobe InDesign`, `Adobe Illustrator` or `Adobe Photoshop`, open the menu `Window > Extensions > DALIM ES CONNECTOR`, the ESConnector will then appear in the side panel.

### Connexion GUI

| Index page | Login page |
| ---------- | ---------- |
| <img src="./doc/rsrc/gui1.png" width="300"/> | <img src="./doc/rsrc/gui2.png" width="300" /> |  

### Index page

If you open the ESConnector for the first time, you'll land on the index page.

Here you can enter the the ES server name you want to connect. The Server URL either a hostname, a hostname with a port number or a URL.
```
es6dam.es-cloud.com
es6dam.es-cloud.com:443
https://es6dam.es-cloud.com
```
Below the `Connect` button, you will retreive all the servers you've previoulsly connected. By selecting on one of them, the ESConnector will attempt to connect immediately to the server.

### Login page  

Once connected to the server, you'll be invited to sign in by entering your credentials.
If the ES server you choose is delegating the authentication to a SSO server, the login page of the identity provider will be displayed instead.

### ESConnector GUI

| Browser tab | Document tab | Settings tab |
| ----------- | ------------ | ------------ |
| <img src="./doc/rsrc/gui3.png" width="300"/> | <img src="./doc/rsrc/gui4.png" width="300" /> | <img src="./doc/rsrc/gui5.png" width="300" /> |

### Browser tab

The `Browser` tab allows you to navigate in the repository. You can place assets in your document from this view.

#### Navigation bar

|   | Action | Description |
| - | ----- | ----------- |
| <img src="./doc/rsrc/baseline_home_black_18dp.png"/>       | **Home**    | Go to the root folder of the repository |
| <img src="./doc/rsrc/baseline_arrow_back_black_18dp.png"/> | **Back**    | Go to the parent folder |
| <img src="./doc/rsrc/baseline_search_black_18dp.png"/>     | **Search**  | Enable the search mode |
| <img src="./doc/rsrc/baseline_clear_black_18dp.png"/>      | **Clear search**  | Exit the search mode |
| <img src="./doc/rsrc/baseline_refresh_black_18dp.png"/>    | **Refresh** | Refresh the content of the current folder |

The navigation will always display the name of the current folder in the middle. When clicked, this text will expand as a breadcrumb allowing you to go back to any parent folder from your location. When the search mode is active, this breadcrumb will turn into a search field.

#### Action bar

| &nbsp; | Action | Description |
| :: | :----- | :---------- |
| <img src="./doc/rsrc/baseline_create_black_18dp.png"/>         | **Edit**       | Checkout the selected document and start editing it |
| <img src="./doc/rsrc/baseline_add_box_black_18dp.png"/>        | **Place**      | Place the selected asset(s) in the active document |
| <img src="./doc/rsrc/outline_lock_black_18dp.png"/>            | **Lock**       | Lock the selected document on the repository |
| <img src="./doc/rsrc/outline_lock_open_black_18dp.png"/>       | **Unlock**     | Unlock the selected document on the repository |
| <img src="./doc/rsrc/baseline_backup_black_18dp.png"/>         | **Upload**     | Upload the active document on the repository |
| <img src="./doc/rsrc/baseline_link_black_18dp.png"/>           | **Link all**   | Link all non-http asset(s) with the one(s) on the server having the same name |
| <img src="./doc/rsrc/baseline_picture_as_pdf_black_18dp.png"/> | **Export PDF** | Export the active document as PDF and upload it on the server |


### Document tab  

The `Document` tab displays information about the active document and the linked assets it contains.  

#### Document action bar

|    | Action | Description |
| :: | :----- | :---------- |
| <img src="./doc/rsrc/baseline_backup_black_18dp.png"/>         | **Upload**     | Upload the active document on the repository |
| <img src="./doc/rsrc/outline_backup_black_18dp.png"/>          | **Check in**   | Check the active document in. The document will be automatically unlocked. |
| <img src="./doc/rsrc/outline_lock_black_18dp.png"/>            | **Lock**       | Lock the active document on the repository |
| <img src="./doc/rsrc/outline_lock_open_black_18dp.png"/>       | **Unlock**     | Unlock the active document on the repository |
| <img src="./doc/rsrc/baseline_picture_as_pdf_black_18dp.png"/> | **Export PDF** | Export the active document as PDF and upload it on the server |
| <img src="./doc/rsrc/baseline_launch_black_18dp.png"/>         | **Go to**      | Open the Browser tab on the active document | 

#### Asset action bar

|    | Action | Description |
| :: | :----- | :---------- |
| <img src="./doc/rsrc/baseline_hd_black_18dp.png"/>            | **Set highres** | Replace the selected asset with its High resolution rendition |
| <img src="./doc/rsrc/outline_hd_black_18dp.png"/>             | **Set lowres**  | Replace the selected asset with its Low resolution rendition |
| <img src="./doc/rsrc/outline_cloud_download_black_18dp.png"/> | **Download**    | Download the selected asset |
| <img src="./doc/rsrc/outline_backup_black_18dp.png"/>         | **Check in**    | Check the selected asset in |
| <img src="./doc/rsrc/baseline_backup_black_18dp.png"/>        | **Upload**      | Upload the selected asset. The asset will be upload in the server based on the location in the browser tab |
| <img src="./doc/rsrc/baseline_link_off_black_18dp.png"/>      | **Unlink**      | Unlink the selected asset from the server | 
| <img src="./doc/rsrc/baseline_launch_black_18dp.png"/>        | **Go to**       | Open the Browser tab on the selected asset |


### Settings tab

The `Settings` tab allows you to set your preferences and manage the connection. You can also change the account and the connected repository in this interface.

|    | Action | Description |
| :: | :----- | :---------- |
| <img src="./doc/rsrc/baseline_exit_to_app_black_18dp.png"/> | **Change repository**   | Leave the current repository and go back to the index page of the connector |
| <img src="./doc/rsrc/baseline_logout_black_18dp.png"/>      | **Sign out**            | Sign out from the current repository and go back to the login page |
| <img src="./doc/rsrc/baseline_create_black_18dp.png"/>      | **Change cache folder** | Change the location of the cache folder | 
| <img src="./doc/rsrc/baseline_delete_black_18dp.png"/>      | **Clear cache**         | Clear the cache of the ES Connector |


## Under the hood

The ESConnector tends to use only standard functions of the host application to edit the document and its asset links. When hosted in an Adobe Creative Cloud applications, the ES Connnector will communicate with the application using the [CEP extension framework](https://github.com/Adobe-CEP/CEP-Resources)  and will performs all the Document and Asset links operations in [ExtendScript](https://www.adobe.com/devnet/scripting.html). 

When an Asset coming from the repository is placed in the Document, a set of metadata will be associated to it in order to be able to keep trace of its origin, remote location, version, etc. <br>Depending on the host application, these metadata will be store in a InDesign Label or in an Illustrastor Tag. In both cases, it will be stored as a stringified JSON object and can be extracted as such.

The metadata JSON object has the following properties:

| Name       | Description |
| ---------- | ----------- |
| assetId    | The unique ID of the asset withing the repository                    | 
| assetUrl   | An URL pointing to the asset on the repository                       |
| assetPath  | The virtual path of the asset within the repository                  |
| contentId  | The ID of the asset rendition placed in the document                 |
| rendition  | The current rendition name of the asset as it appear in the document |
| repository | The name of the repository the asset comes from                      |
| version    | The version of the asset placed in the document                      |

These metadata can be extracted from the document as shown below. The method to extract the metadata will differ between InDesign and Illustrator.
As the metadata are store as a stringified JSON, you will have to decode the value using a JSON library. The JSON encoding/decoding library `json.jsx` is provided with the ES Connector, you can find it in `src/lib/esconnector-1.0.0/`

In `Adobe InDesign`, you have to extract a label named `metadata`
```js
//@include "./json.jsx"

var metadata = JSON.parse( app.activeDocument.links[0].extractLabel("metadata") );
$.writeln(metadata.assetPath);

// Output: /File System/DAM/Assets/pears.png
```

In `Adobe Illustrator`, you have to extract a Tag named `metadata`
```js
//@include "./json.jsx"

var metadata = JSON.parse( app.activeDocument.placedItems[0].tags.getByName(name).value );
$.writeln(metadata.assetPath);

// Output: /File System/DAM/Assets/pears.png
```

## The Developer's Corner

### How to setup an ES Connector development environment 

To build and deploy the ESConnector locally for development purpose, follow these steps **(MacOS only)**.

**Step 1** - Unzip the archive `ESConnector_projet.tgz` or clone the repository, then go in the project folder.
```
$ unzip ESConnector_project.zip -d ./ESConnector
$ cd ./ESConnector
```

**Step 2** - Copy the `src` or `build/output` folder as `ESConnector` in the Adobe CEP folder.

Link the project `src` folder in the Adobe CEP extension folder.
```
$ ln -s ./src "/Library/Application Support/Adobe/CEP/extensions/ESConnector"
```

**Step 3** - Enable the debug mode to run non signed extension. Depending on the version of Adobe CC you have, the command might differ.

For `Adobe CC 2019` and `2020`
```
$ defaults write ~/Library/Preferences/com.adobe.CSXS.9.plist PlayerDebugMode 1
```

For `Adobe CC 2021`
```
$ defaults write ~/Library/Preferences/com.adobe.CSXS.10.plist PlayerDebugMode 1
```

**Step 4** - Open either your `Adobe InDesign`, `Adobe Illustrator` or `Adobe Photoshop` and then open menu `Window > Extensions > DALIM ES CONNECTOR`

From now on, all the changes you will do in the `src` folder will automatically apply to the ES Connector running in the host application.

### ES Connector Project folder structure

| File or folder                  |   |
| ------------------------------- | - |
| `/doc/**`                       | The ES Connector documentation  |
| `/src/CSXS/manifest.xml`        | The CEP extension manifest file |
| `/src/WEB-INF/web.xml`          | A web.xml file for J2EE container compliance |
| `/src/gui/init.jsx`             | The ES Connector initialization script |
| `/src/gui/index.jsx`            | The index and login page GUI |
| `/src/gui/application.jsx`      | The main application GUI |
| `/src/gui/hooks.jsx`            | Some custom React Hooks |
| `/src/gui/icons.jsx`            | The definition of all the GUI icons |
| `/src/gui/locale.jsx`           | The translations for the GUI in all languages |
| `/src/gui/theme.jsx`            | The GUI theme builder |
| `/src/gui/*.png`                | GUI images |
| `/src/lib/babel-6.26.0/*`       | The babel library used to compile the interface in development mode and during the compilation. |
| `/src/lib/csinterface-9.4.0/*`  | The Adobe CSInterface library to communicate with Adobe products from the extension. |
| `/src/gui/esconnector-1.0.0/esconnector.development.js` | The ESConnector controller |
| `/src/gui/esconnector-1.0.0/host.jsx`                   | The ExtendScript libray used by the ES Connector to manipulate the documents |
| `/src/gui/esconnector-1.0.0/json.jsx`                   | An ExtendScript implementation of a JSON encoder/decoder |
| `/src/gui/material-ui-4.9.12/*` | The Material UI library |
| `/src/gui/react-16.13/*`        | The React JS framework  |
| `/src/.debug`                   | The .debug file to enabled the CEP extension debug mode |
| `/src/esconnector.xml`          | The Office AddIn description file |
| `/src/index.html`               | The index html page for the developement environement |
| `/src/index.production.html`    | The index html page for the production environement |
| `/src/logout.html`              | The logout page called when the user logs out the connector |
| `/build.sh`                     | The build script |
| `/install_mac`                  | The Mac OS install script |
| `/install_win.bat`              | The Windows install script |

### How to debug the ES Connector 

To debug the ES Connector we recommand to use the application [CEF Client](https://github.com/Adobe-CEP/CEP-Resources/tree/master/CEP_10.x/Cefclient_v74). Since Adobe Creative Cloud 2021 you can also debug CEP extensions using a regular Chrome web browser.

Only the development version of the ES Connector has the debug mode actived. To connect a debugger to the extension, just start the [CEF Client](https://github.com/Adobe-CEP/CEP-Resources/tree/master/CEP_10.x/Cefclient_v74) and open one of the URL below in it (each application opens a different debug port).

| Application | Port | Debug URL             |
| ----------- | ---- | --------------------- |
| Photoshop   | 8087 | http://127.0.0.1:8087 |
| InDesign    | 8088 | http://127.0.0.1:8088 |
| Illustrator | 8089 | http://127.0.0.1:8089 |

For more details about debugging a CEP extensions, please refer to the [Remote debugging](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_10.x/Documentation/CEP%2010.0%20HTML%20Extension%20Cookbook.md#remote-debugging) section of the CEP documentation.

### How to build the ES Connector 

To build the ES Connector you simply have to execute the `build.sh` script sitting at the root of the project.
```sh
$ ./build.sh
```
As a result of the build process, the script will produce 3 ZIP archives in the `build` folder: 

| ZIP Archive                      | Content                   |
| -------------------------------- | ------------------------- |
| `./build/ESConnector_dev.zip`    | A development version of the ES Connector that can be distributed and installed for testing purpose. It has the debug mode activated. This archive is basically just a ZIP of the `src` folder. |
| `./build/ESConnector_prd.zip`    | A production version of the ES Connector that can be distributed and published on Adobe Exchange. All the sources are converted to ECMAScriptn 5 and compressed. The debug mode is not activated. |
| `./build/ESConnector_install.zip` | This archive contains the production version of the ES Connector along with an installer for Mac OS and Windows. The prupose of the archive is to be able to distribute the ES Connector out of the Adobe Exchange plateform |

### How to deploy the ES Connector 

The ES Connector provides its own interface, therefore it can be deployed as a standalone CEP extension by using the `ESConnector_install.zip` archive. However, we recommand to publish the ES Connector through the Adobe Exchange plateform so anyone can get it easily. You can take a look at this [Getting started](https://helpx.adobe.com/exchange/help/getting-started-developer.html) page to know how to publish extensions on Adobe Exchange.

A DALIM ES server can also provides its own custom version of the ES Connector. To do that, you have to expose the content of one of the 2 archive `ESConnector_dev.zip` or `ESConnector_prd.zip` under the URL `/ESConnector` on the same origin than the ES server itself.
For instance if your ES server is accessible at `https://www.es-cloud.com/Esprit` you have to expose your custom ES Connector as `https://www.es-cloud.com/ESConnector`. Then, when a ES Connector will connects that DALIM ES repository, it will automatically use the exposed ES Connector instead of the built-in interface.

Note that the 2 archive `ESConnector_dev.zip` or `ESConnector_prd.zip` can also be deployed on a J2EE container like Tomcat. You simply have to copy one of them as `ESConnector.war` in the `webapp` folder.

## Controller Object Reference

...
```
cef.controller
sd
```
...

#### getActiveDocument
```js
cef.controller.getActiveDocument(): Document
```

Returns a `Document` object describing the active document displayed in the host application

#### getActiveDocumentLink
```js 
cef.controller.getActiveDocumentLink(
	linkId: String
): Link
```

Returns a `Link` object from a given link Id or `null` if no link match.

#### getRepositoryName
```js
cef.controller.getRepositoryName(): String
```

Returns the current repository name or `null` if the connector is not yet connected to any repository (e.g. on the server selection page)

#### getAccountName
```js 
cef.controller.getAccountName(): String
```

Returns the account name of the current user or `null` if the connector is not yet authenticated.

#### getIndexURL
```js
cef.controller.getIndexURL(): String
```

Returns the URL of the index page of the Connector. This function is useful to redirect the user to the server selection page.

#### isSupportedDocumentType
```js
cef.controller.isSupportedDocumentType(
	type: String
): Boolean
```

Returns whether or not the provided mimetype is a supported document format for the host application. We consider as a supported document type, the kind of file the host application is able to open and save.

#### isSupportedLinkType<br>isSupportedAssetType

```js
cef.controller.isSupportedAssetType(
	type: String
): Boolean
```

Returns whether or not the provided mimetype is a supported asset format for the host application. We consider as a supported asset, the kind of files that can be placed inside or linked to a document.

#### getAsset
```js
cef.controller.getAsset(
	assetId: String | Integer, 
	callback: function(err: Object, asset: Asset)
)
```

Retreives the asset properties from a given `assetId`.

#### `cef.controller.listAssets(assetId, callback)`
+ `assetId` - An asset ID
+ `callback <Function(err, asset)>`
	+ `err <Object>` - The error message if one occurs, `null` otherwise.
	+ `assetList <Asset[]>` - An array of `Asset` or `null` if the provided `assetId` was not the ID of a container.

Retreives all the assets in a container (folder) from a given `assetId`. If the `assetId` is the one of a document, the function will retreive all the revisions of the document.

#### `cef.controller.searchAssets(query, callback)`
+ `query` - A search query
+ `callback <Function(err, asset)>`
	+ `err <Object>` - The error message if one occurs, `null` otherwise.
	+ `assetList <Asset[]>` - An array of `Asset` matching the search `query`. 

Retreives all the assets matching the search `query`.

#### `cef.controller.checkAssetOut(assetId, callback)`

...

#### `cef.controller.cancelAssetCheckOut(assetId, callback)`

...

#### `cef.controller.checkAssetIn(assetId, [data,] callback)`

...	

#### `cef.controller.lockAsset(assetId, callback)`

...

#### `cef.controller.unlockAsset(assetId, callback)`

...

#### `cef.controller.newDocument(callback)`

...

#### `cef.controller.getPDFExportPresets(callback)`
+ `callback <Function(err, presets)>`
	+ `err <Object>` - The error message if one occurs
	+ `presets <String[]>` -  A list of preset names

Retrieves the list of available PDF presets in the host application.

*(Adobe Suite Only)*

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

#### `cef.controller.exportPDF(path [, preset], callback)`
+ `path <String>` - The path in Asset Management System where to upload the exported PDF.
+ `preset <String>` - Optional. The preset to use for the PDF export
+ `callback <Function(err, asset)>`
	+ `err <Object>` - The error message if one occurs, `null` otherwise.
	+ `asset <Asset>` - An object repsenting the newly created or updated asset.
	
Exports a PDF version of the current document and upload it on the connected Asset Management System.

#### `cef.controller.getCacheFolder()`

Returns the local path to the cache folder.

*(Adobe Suite Only)*

#### `cef.controller.getCacheSize(callback)`
+ `callback <Function(err, size)>`
	+ `err <Object>` - The error message if one occurs, `null` otherwise.
	+ `presets <String[]>` -  The size of the folder in bytes

Computes the total size of the cache folder.

*(Adobe Suite Only)*

#### `cef.controller.clearCache(callback)`
+ `callback <Function(err)>`
	+ `err <Object>` - The error message if one occurs, `null` otherwise.

Removes recusively the content of the cache folder.

*(Adobe Suite Only)*
