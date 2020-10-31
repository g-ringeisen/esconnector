rm -rf "./build"

npm install -g 'jsxbin' '@babel/core' '@babel/preset-react' '@babel/plugin-transform-modules-commonjs'

#preset="${NODE_HOME}/lib/node_modules/@babel/preset-react"
#plugins="${NODE_HOME}/lib/node_modules/@babel/plugin-transform-modules-commonjs"

## BUILD LIB
for libname in "csinterface-9.4.0" "material-ui-4.9.12" "react-16.13"
do
	echo 
	echo "Build library : ${libname}"

	mkdir -p "./build/lib/${libname}"
	for filename in `ls -1 "./src/lib/${libname}" | grep -v '.development.js' | grep -v '.jsx'`
	do 
		cp "./src/lib/${libname}/${filename}" "./build/lib/${libname}/${filename}" 
	done
done

libname="esconnector-1.0.0"
echo 
echo "Build library : ${libname}"

babel --presets "@babel/preset-react" --minified --no-comments -o "./build/lib/${libname}/esconnector.production.min.js" "./src/lib/${libname}/esconnector.development.js"
jsxbin -o "./build/lib/${libname}/json.jsxbin" -i "./src/lib/${libname}/json.jsx"
jsxbin -o "./build/lib/${libname}/host.jsxbin" -i "./src/lib/${libname}/host.jsx"
## TEMP - COPY .JSX FILES
cp "./src/lib/${libname}/json.jsx" "./build/lib/${libname}/json.jsx"
cp "./src/lib/${libname}/host.jsx" "./build/lib/${libname}/host.jsx"

## BUILD GUI
echo 
echo "Build GUI"

mkdir -p "./build/gui"
for filename in `ls -1 "./src/gui" | grep -v '.development.js' | grep -v '.jsx'`
do 
	cp "./src/gui/${filename}" "./build/gui/${filename}" 
done
babel --presets "@babel/preset-react" --plugins "@babel/plugin-transform-modules-commonjs" --minified --no-comments -o "./build/gui/gui.min.js"  "./src/gui/hooks.jsx" "./src/gui/icons.jsx" "./src/gui/theme.jsx" "./src/gui/application.jsx" "./src/gui/index.jsx" "./src/gui/locale.jsx"

echo 
echo "Copy resources"
## BUILD
cp -rp "./src/esconnector.xml" "./build/esconnector.xml"
cp -rp "./src/CSXS" "./build/CSXS"
cp "./src/index.production.html" "./build/index.html"

echo 
echo "Done"
