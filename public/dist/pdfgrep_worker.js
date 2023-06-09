importScripts('pdfgrep_pipeline.js');

self.pipeline = null

onmessage = async ({ data: { getFileData, files, query, pdfgrep_wasm, pdfgrep_js } }) => {
    if (pdfgrep_wasm && pdfgrep_js) {
        try {
            // _ => postMessage({ print: "initialized" }),
            self.pipeline = new PDFPipeline(
                pdfgrep_wasm, 
                pdfgrep_js, 
                msg => postMessage({print: msg}), 
                _ => console.log("initialized"),
                PDFPipeline.ScriptLoaderWorker
            );
        } catch (err) {
            postMessage({exception: 'Exception during initialization: ' + err.toString() + '\nStack:\n' + err.stack});
        }
    }
    else if (getFileData && self.pipeline) {
        try {
            const fileData = await self.pipeline.getFile(getFileData.fileName);
            postMessage({
                singleFileData: {
                    fileName: getFileData.fileName,
                    fileData: fileData,
                    currentPage: getFileData.currentPage
                }
            });
        } catch (err) {
            postMessage({exception: 'Exception during getFile: ' + err.toString() + '\nStack:\n' + err.stack});
        }
    }
    else if (files && self.pipeline) {
        // upload files
        try {
            const fileData = await self.pipeline.upload(files);
            postMessage({fileData: fileData});
        } catch (err) {
            postMessage({ exception: 'Exception during upload: ' + err.toString() + '\nStack:\n' + err.stack });
        }
    }
    else if (query && self.pipeline) {
        try
        {
            postMessage(await self.pipeline.search(query));
        }
        catch(err)
        {
            postMessage({exception: 'Exception during compilation: ' + err.toString() + '\nStack:\n' + err.stack});
        }
    }
}