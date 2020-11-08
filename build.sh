rm -rf "./build"

npm install -g 'jsxbin' '@babel/core' '@babel/preset-react' '@babel/plugin-transform-modules-commonjs'


cd `dirname $0`
root_dir=`pwd`
cd - > /dev/null

src_dir="${root_dir}/src"
build_dir="${root_dir}/build"
output_dir="${build_dir}/output"

pkgname="ESConnector"

## BUILD LIB
for libname in "csinterface-9.4.0" "material-ui-4.9.12" "react-16.13"
do
	echo "Build library : ${libname}"

	mkdir -p "${output_dir}/lib/${libname}"
	for filename in `ls -1 "${src_dir}/lib/${libname}" | grep -v '.development.js' | grep -v '.jsx'`
	do 
		cp "${src_dir}/lib/${libname}/${filename}" "${output_dir}/lib/${libname}/${filename}" 
	done
done

libname="esconnector-1.0.0"
echo "Build library : ${libname}"
babel --presets "@babel/preset-react" --minified --no-comments -o "${output_dir}/lib/${libname}/esconnector.production.min.js" "${src_dir}/lib/${libname}/esconnector.development.js"
# CSInterface does no longer support dynamic loading of JSXBIN 
#jsxbin -o "${output_dir}/lib/${libname}/json.jsxbin" -i "${src_dir}/lib/${libname}/json.jsx"
#jsxbin -o "${output_dir}/lib/${libname}/host.jsxbin" -i "${src_dir}/lib/${libname}/host.jsx"
babel --minified --no-comments -o "${output_dir}/lib/${libname}/json.jsx" "${src_dir}/lib/${libname}/json.jsx" 
babel --minified --no-comments -o "${output_dir}/lib/${libname}/host.jsx" "${src_dir}/lib/${libname}/host.jsx" 

## BUILD GUI
echo "Build GUI"
mkdir -p "${output_dir}/gui"
for filename in `ls -1 "${src_dir}/gui" | grep -v '.development.js' | grep -v '.jsx'`
do 
	cp "${src_dir}/gui/${filename}" "${output_dir}/gui/${filename}" 
done
babel --presets "@babel/preset-react" --plugins "@babel/plugin-transform-modules-commonjs" --minified --no-comments -o "${output_dir}/gui/gui.min.js"  "${src_dir}/gui/hooks.jsx" "${src_dir}/gui/icons.jsx" "${src_dir}/gui/theme.jsx" "${src_dir}/gui/application.jsx" "${src_dir}/gui/index.jsx" "${src_dir}/gui/locale.jsx"

echo "Copy resources"
cp -rp "${src_dir}/esconnector.xml" "${output_dir}/esconnector.xml"
cp -rp "${src_dir}/CSXS" "${output_dir}/CSXS"
cp "${src_dir}/index.production.html" "${output_dir}/index.html"

echo 
echo "Build Adobe Exchange Packages"

cd "${output_dir}"
zip -r "${build_dir}/${pkgname}.prd.zip" * > /dev/null
cd - > /dev/null

cd "${src_dir}"
zip -r "${build_dir}/${pkgname}.dev.zip" * > /dev/null
cd - > /dev/null


echo 
echo "Done"
