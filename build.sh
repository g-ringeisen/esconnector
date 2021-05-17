

cd `dirname $0`
root_dir=`pwd`
cd - > /dev/null

src_dir="${root_dir}/src"
output_dir="${root_dir}/output"
build_dir="${root_dir}/build"

pkgname="ESConnector"

rm -rf "${output_dir}"
mkdir -p "${output_dir}"

rm -rf "${build_dir}"
mkdir -p "${build_dir}"

## NPM INIT
npm install -g 'jsxbin' '@babel/core' '@babel/preset-react' '@babel/plugin-transform-modules-commonjs'

## BUILD LIB
for libname in "csinterface-9.4.0" "material-ui-4.9.12" "react-16.13"
do
	echo "Build library : ${libname}"

	mkdir -p "${build_dir}/lib/${libname}"
	for filename in `ls -1 "${src_dir}/lib/${libname}" | grep -v '.development.js' | grep -v '.jsx'`
	do 
		cp "${src_dir}/lib/${libname}/${filename}" "${build_dir}/lib/${libname}/${filename}" 
	done
done

libname="esconnector-1.0.0"
echo "Build library : ${libname}"
babel --presets "@babel/preset-react" --minified --no-comments -o "${build_dir}/lib/${libname}/esconnector.production.min.js" "${src_dir}/lib/${libname}/esconnector.development.js"
# CSInterface does no longer support dynamic loading of JSXBIN 
#jsxbin -o "${build_dir}/lib/${libname}/json.jsxbin" -i "${src_dir}/lib/${libname}/json.jsx"
#jsxbin -o "${build_dir}/lib/${libname}/host.jsxbin" -i "${src_dir}/lib/${libname}/host.jsx"
babel --minified --no-comments -o "${build_dir}/lib/${libname}/json.jsx" "${src_dir}/lib/${libname}/json.jsx" 
babel --minified --no-comments -o "${build_dir}/lib/${libname}/host.jsx" "${src_dir}/lib/${libname}/host.jsx" 

## BUILD GUI
echo "Build GUI"
mkdir -p "${build_dir}/gui"
for filename in `ls -1 "${src_dir}/gui" | grep -v '.development.js' | grep -v '.jsx'`
do 
	cp "${src_dir}/gui/${filename}" "${build_dir}/gui/${filename}" 
done
babel --presets "@babel/preset-react" --plugins "@babel/plugin-transform-modules-commonjs" --minified --no-comments -o "${build_dir}/gui/gui.min.js"  "${src_dir}/gui/hooks.jsx" "${src_dir}/gui/icons.jsx" "${src_dir}/gui/theme.jsx" "${src_dir}/gui/application.jsx" "${src_dir}/gui/index.jsx" "${src_dir}/gui/locale.jsx" "${src_dir}/gui/init.jsx"

echo "Copy resources"
cp -rp "${src_dir}/esconnector.xml" "${build_dir}/esconnector.xml"
cp -rp "${src_dir}/CSXS" "${build_dir}/CSXS"
cp -rp "${src_dir}/WEB-INF" "${build_dir}/WEB-INF"
cp "${src_dir}/index.production.html" "${build_dir}/index.html"
cp "${src_dir}/logout.html" "${build_dir}/logout.html"

echo 
echo "Build Adobe Exchange Packages"

cd "${build_dir}"
zip -r "${output_dir}/${pkgname}_prd.zip" * > /dev/null
cd - > /dev/null

cd "${src_dir}"
zip -r "${output_dir}/${pkgname}_dev.zip" * > /dev/null
cd - > /dev/null

echo 
echo "Build Beta Distribution Package"
cd "${root_dir}"
zip "${output_dir}/${pkgname}_install.zip" "install_mac" "install_win.bat" "${output_dir}/${pkgname}_prd.zip" > /dev/null
cd - > /dev/null

echo 
echo "Done"
