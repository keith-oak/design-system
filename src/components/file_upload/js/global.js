(function () {
    "use strict";

    /**
     * @module fileUploads
     */
    let fileUploads = {
        inputs: {},
    };

    /**
     * Loading template for file preview
     *
     * @memberof module:fileUploads
     */
    const loadingTemplate = function (file) {
        const fileName = file.name;
        const fileTemplate = document.createElement("div");

        fileTemplate.classList.add("qld__form-file");

        fileTemplate.innerHTML = `<div class="qld__form-file-info-wrapper"><div class="qld__form-file-loader">
                            <div class="qld__loading_spinner qld__loading_spinner--landscape" role="status">
                                <span class="qld__loading_spinner-wheel"></span>
                            </div>
                        </div>
                        <div class="qld__form-file-info">
                            <p class="qld__display-xs qld__form-file-info-name">${fileName}</p>
                            <span class="qld__form-file-info-status">Uploading...</span>
                        </div></div>
                        <div class="qld__form-file-actions"></div>`;
        return fileTemplate;
    };

    /**
     * Success template for file preview
     *
     * @memberof module:fileUploads
     */
    const successTemplate = function (file) {
        const fileName = file.name;
        const fileTemplate = document.createElement("div");
        let fileSize = null;
        const fileId = file.id != undefined ? file.id : fileName;
        let fileType = file.type != undefined ? getAssetType(file.type) : "";

        if (file && file.size) {
            fileSize = Math.ceil(file.size / 1000);
        }

        fileTemplate.classList.add("qld__form-file", "qld__form-file--success");

        fileTemplate.innerHTML = `<div class="qld__form-file-info-wrapper"><div class="qld__form-file-loader">
                                        <svg class="qld__icon qld__icon--lg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><use href="${fileUploads.iconDataPath}#${fileType !== "" ? fileType.iconClass : ""}"></use></svg>
                                    </div>
                                    <div class="qld__form-file-info">
                                        <p class="qld__display-xs qld__form-file-info-name">${fileName}</p>
                                        <span class="qld__form-file-info-status">
                                            <svg class="qld__icon qld__icon--sm" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><use href="${fileUploads.iconDataPath}#status-success"></use></svg>
                                            Upload successful${fileSize !== null ? `, ${fileSize}KB` : ""}
                                        </span>
                                    </div></div>
                                    <div class="qld__form-file-actions">
                                        <button class="qld__btn qld__btn--tertiary qld__btn--icon-lead qld__form-file-delete-btn" data-file-id="${fileId}">
                                            <svg class="qld__icon qld__icon--sm" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><use href="${fileUploads.iconDataPath}#delete"></use></svg>
                                            <span class="qld__form-file-delete-btn-remove">Remove</span>
                                        </button>
                                    </div>`;

        return fileTemplate;
    };

    /**
     * Error template for file preview
     *
     * @memberof module:fileUploads
     */
    const errorTemplate = function (file, error) {
        const fileName = file.name;
        const fileTemplate = document.createElement("div");
        const fileId = file.id != undefined ? file.id : fileName;
        console.log("error:", file.name);
        fileTemplate.classList.add("qld__form-file", "qld__form-file--error");

        fileTemplate.innerHTML = `<div class="qld__form-file-info-wrapper"><div class="qld__form-file-loader">
                                        <svg class="qld__icon qld__icon--lg" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><use href="${fileUploads.iconDataPath}#document-error"></use></svg>
                                    </div>
                                    <div class="qld__form-file-info">
                                        <p class="qld__display-xs qld__form-file-info-name">${fileName}</p>
                                        <span class="qld__form-file-info-status">
                                            <svg class="qld__icon qld__icon--sm" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><use href="${fileUploads.iconDataPath}#status-error"></use></svg>
                                            ${error}
                                        </span>
                                    </div></div>
                                    <div class="qld__form-file-actions">
                                        <button class="qld__btn qld__btn--tertiary qld__btn--icon-lead qld__form-file-delete-btn" data-file-id="${fileId}">
                                            <svg class="qld__icon qld__icon--sm" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><use href="${fileUploads.iconDataPath}#delete"></use></svg>
                                            <span class="qld__form-file-delete-btn-remove">Remove</span>
                                        </button>
                                    </div>`;

        return fileTemplate;
    };

    /**
     * Return the asset type code for the selected file
     *
     * @memberof module:fileUploads
     */
    const getAssetType = function (type) {
        let assetType = { type: "file", iconClass: "document" };
        let typeLowerCase = type.toLowerCase();

        switch (true) {
            case typeLowerCase.indexOf("pdf") != -1:
                assetType = { type: "pdf_file", iconClass: "document-pdf" };
                break;
            case typeLowerCase.indexOf("word") != -1:
                assetType = { type: "word_doc", iconClass: "document-word" };
                break;
            case typeLowerCase.indexOf("image") != -1:
                assetType = { type: "image", iconClass: "image" };
                break;
            case typeLowerCase.indexOf("excel") != -1:
                assetType = { type: "excel_doc", iconClass: "document-spreadsheet" };
                break;
            default:
                break;
        }

        return assetType;
    };

    /**
     * Check that the selected file is valid
     *
     * @memberof module:fileUploads
     */
    const isFileValid = function (file, input_field_settings) {
        const currentFiles = input_field_settings.files;
        const totalFiles = currentFiles.length;
        const maxFiles = input_field_settings.max_files;
        const maxFileSize = input_field_settings.max_file_size;
        const fileTypes = input_field_settings.file_types.split(",");
        const fileSize = file.size;
        const fileName = file.name;
        // Regex testing for characters: <, >, :, ", /, \, |, ?, *
        // Also tests for control characters: (\x00 to \x1F)
        // const illegalFileNameCharacters = /[<>:"/\\|?*\x00-\x1F]/;

        // Combined regex for both illegal characters and HTML/JS patterns
        const illegalFileNameCharacters = /[<>:"/\\|?*\x00-\x1F]|(<script.*?>|<\/script>|<.*?>|javascript:|<html.*?>|<\/html>)/i;

        // If the file name contains illegal characters
        if (illegalFileNameCharacters.test(fileName)) {
            console.error("Unsupported characters in file name. Only use letters, numbers, space, and special characters: -_(’");
            return "Unsupported characters in file name.";
        }

        // If a file of the same name has already been uploaded to the field
        if (
            currentFiles.some(function (item) {
                return file.id == item.id;
            })
        ) {
            console.error("Duplicate file name");
            return "Filename: '" + fileName + "' already in use. Please rename file before trying again.";
        }

        // If the file type is not accepted
        if (
            !fileTypes.some(function (type) {
                return file.type.match(type);
            })
        ) {
            console.error("Incorrect file type");
            return "The selected file must be a " + fileTypes.join(", ");
        }

        // If file size exceeds the maximum
        if (fileSize / (1024 * 1024) > maxFileSize) {
            console.error("Max file size " + maxFileSize + " exceeded.");
            return "The selected file must be smaller than " + maxFileSize + "MB";
        }

        // If the max file limit has been reached
        if (totalFiles >= maxFiles) {
            console.error("Max number of files reached");
            return "You can only select up to " + maxFiles + " files at the same time";
        }

        // If the max file limit has been reached
        if (fileSize <= 0) {
            console.error("The selected file is empty");
            return "The selected file is empty";
        }

        return true;
    };

    /**
     * Initialise any file input components on the page
     *
     * @memberof module:fileUploads
     */
    fileUploads.init = function () {
        const iconDataPathElement = document.querySelector("form.qld__form--validate[data-path]");
        fileUploads.iconDataPath = iconDataPathElement ? iconDataPathElement.getAttribute("data-path") : "";

        // Store all file input fields in inputs property
        let $file_inputs = QLD.utils.listToArray(document.querySelectorAll("input[type=file].qld__file-input"));

        // Bind listeners, and initialise settings object for each input field
        for (let i = 0; i < $file_inputs.length; i++) {
            const $input = $file_inputs[i];
            const $dropzone_element = $input.closest(".qld__form-file-wrapper").querySelector(".qld__form-file-dropzone");
            const $file_list = $input.closest(".qld__form-file-wrapper").querySelector(".qld__form-file-preview");

            // Settings object for file input
            fileUploads.inputs[$input.id] = {
                id: $input.id,
                input_element: $input,
                create_location: $input.dataset["createLocation"],
                files: $input.dataset["files"] !== "" ? JSON.parse($input.dataset["files"]) : [],
                max_file_size: $input.dataset["maxSize"],
                file_types: $input.dataset["fileTypes"],
                max_files: $input.dataset["maxFiles"],
                file_list_element: $file_list,
                dropzone_element: $dropzone_element,
                js_api_key: $input.dataset["jsApiKey"],
                displayFiles: displayExistingFiles,
            };

            // Add event listeners
            addListeners(fileUploads.inputs[$input.id]);
            // Custom validation for JS API if the field is required
            if (fileUploads.inputs[$input.id].js_api_key !== undefined && fileUploads.inputs[$input.id].input_element.hasAttribute("required")) {
                addValidation(fileUploads.inputs[$input.id]);
            }
            // Set the instance of js api to the input settings object
            if (fileUploads.inputs[$input.id].js_api_key !== undefined && fileUploads.inputs[$input.id].create_location !== undefined) {
                fileUploads.inputs[$input.id].jsApi = jsApi(fileUploads.inputs[$input.id].js_api_key);
            }
        }
    };

    /**
     * Add custom 'required' validation to any required JS API driven file input
     *
     * @memberof module:fileUploads
     */
    const addValidation = function (input_field_settings) {
        const $input = input_field_settings.input_element;

        // Remove required attribute so we can replace it with the following rule
        $input.removeAttribute("required");

        // Custom 'required' validation for input
        if (!$.validator.methods.requiredFileInteraction) {
            $.validator.addMethod(
                "requiredFileInteraction",
                function (value, element) {
                    // Check if the user has interacted with the file input
                    if ($(element).data("interacted")) {
                        // If data-files attribute is empty, invalidate the field
                        return element.dataset["files"] !== "[]" && element.dataset["files"] !== "";
                    } else {
                        // If the user hasn't interacted, require a non-empty value
                        return value.trim() !== "";
                    }
                },
                "This field is required."
            );
        }

        $($input).rules("add", {
            requiredFileInteraction: true,
        });
    };

    /**
     * Add the event listeners for the file input and drag/drop zone
     *
     * @memberof module:fileUploads
     */
    const addListeners = function (input_field_settings) {
        const $fileInput = input_field_settings.input_element;
        const $fileInputWrapper = $fileInput.closest(".qld__form-file-wrapper");
        const $dropArea = $fileInputWrapper.querySelector(".qld__form-file-dropzone");
        const disabledClasses = ["qld__form-file-dropzone--disabled", "qld__form-file-dropzone--updating"];

        // File delete button handler
        $fileInputWrapper.addEventListener("click", function (event) {
            if (event.target.matches(".qld__form-file-delete-btn")) {
                event.preventDefault();

                const fileId = event.srcElement.dataset["fileId"];
                const $fileInfoWrapper = event.target.closest(".qld__form-file");

                deleteFile(input_field_settings, fileId, $fileInfoWrapper);
            }
        });

        // File input change handler
        $fileInput.addEventListener("change", function (event) {
            event.preventDefault();

            // Set file input interacted flag (for validation)
            $fileInput.dataset["interacted"] = true;

            // Don't allow interaction if any disabledClasses are present on dropzone
            if (
                !disabledClasses.some(function (className) {
                    return $dropArea.classList.contains(className);
                })
            ) {
                var files = event.target.files;
                handleFiles(files, input_field_settings);
            }
        });

        // Dragover event listener for dropzone
        $dropArea.addEventListener("dragover", function (event) {
            event.preventDefault();

            // Don't allow interaction if any disabledClasses are present on dropzone
            if (
                !disabledClasses.some(function (className) {
                    return $dropArea.classList.contains(className);
                })
            ) {
                $dropArea.classList.add("qld__form-file-dropzone--dragged-over");
            }
        });

        // Dragleave event listener for dropzone
        $dropArea.addEventListener("dragleave", function (event) {
            event.preventDefault();

            $dropArea.classList.remove("qld__form-file-dropzone--dragged-over");
        });

        // Drop event listener for dropzone
        $dropArea.addEventListener("drop", function (event) {
            event.preventDefault();

            // Set file input interacted flag (for validation)
            $fileInput.dataset["interacted"] = true;

            // Don't allow interaction if any disabledClasses are present on dropzone
            if (
                !disabledClasses.some(function (className) {
                    return $dropArea.classList.contains(className);
                })
            ) {
                var files = event.dataTransfer.files;
                handleFiles(files, input_field_settings);
            }

            $dropArea.classList.remove("qld__form-file-dropzone--dragged-over");
        });
    };

    /**
     * Remove file from file input (and Matrix if using the JS API )
     *
     * @memberof module:fileUploads
     */
    const deleteFile = async function (input_field_settings, fileId, $fileInfo) {
        const currentFiles = input_field_settings.files;
        const isError = $fileInfo.matches(".qld__form-file--error");
        const usingJsApi = input_field_settings.jsApi !== undefined;
        const index = currentFiles.findIndex(function (obj) {
            if (typeof obj === "string") {
                return JSON.parse(obj).id === fileId;
            } else {
                return obj.id === fileId;
            }
        });

        // If file exists in currentFiles array, and it isn't a file with an error, remove it
        if (index !== -1 && !isError) {
            currentFiles.splice(index, 1);
            input_field_settings.files = currentFiles;
            // Update FileList if not using JS API
            if (!usingJsApi) {
                updateFileInputFileList(input_field_settings);
            } else {
                try {
                    await deleteAssetFromMatrix(fileId, $fileInfo, input_field_settings);
                    setFilesDataAttribute(input_field_settings);
                } catch (error) {
                    console.log(error);
                }
            }
        }
        // Validate file input
        $(input_field_settings.input_element).valid();
        // Remove the file info box from preview list
        $fileInfo.remove();
    };

    /**
     * Send trashAsset request to Matrix
     *
     * @memberof module:fileUploads
     */
    const deleteAssetFromMatrix = async function (fileId, $fileInfo, input_field_settings) {
        try {
            const name = $fileInfo.querySelector(".qld__form-file-info-name").innerText;
            const file = { name: name };
            const $loading = loadingTemplate(file);
            const jsApi = input_field_settings.jsApi;

            // Change text from ''Uploading' to 'Deleting' and replace current file info box
            $loading.querySelector(".qld__form-file-info-status").innerText = "Deleting...";
            $fileInfo.replaceWith($loading);

            // Send trashAsset request
            let trashedAsset = await jsApi.trashAsset({
                asset_ids: fileId,
            });

            if (!trashedAsset.hasOwnProperty("error")) {
                $loading.remove();
                return trashedAsset;
            } else {
                throw file;
            }
        } catch (file) {
            const $error = errorTemplate(file, "Unable to delete file");
            $fileInfo.replaceWith($error);
        }
    };

    /**
     * Toggle a class for the file dropzone
     *
     * @memberof module:fileUploads
     */
    const toggleDropzoneClass = function ($dropZone, status) {
        const classNames = status.split(",");

        classNames.forEach(function (className) {
            $dropZone.classList.toggle(`qld__form-file-dropzone--${className}`);
        });
    };

    /**
     * Sanitise File name
     *
     * @memberof module:fileUploads
     */

    const sanitiseAndValidateFileName = function (fileName) {
        // Remove potentially dangerous characters (e.g., <, >, ", /, \, etc.) and unwanted characters
        let sanitisedFileName = fileName
            .replace(/[^a-zA-Z0-9\s\-_\.]/g, "_") // Replace unwanted characters with '_'
            .replace(/[<>:"/\\|?*]/g, "_") // Remove dangerous characters
            .trim(); // Trim leading/trailing spaces

        // Prevent starting or ending with special characters or spaces
        sanitisedFileName = sanitisedFileName.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "");

        // Return the sanitized file name
        return sanitisedFileName;
    };

    /**
     * Handle any files the user has dropped/selected
     *
     * @memberof module:fileUploads
     */
    const handleFiles = async function (files, input_field_settings) {
        const $fileList = input_field_settings.file_list_element;
        const usingJsApi = input_field_settings.jsApi !== undefined;
        const $dropZone = input_field_settings.dropzone_element;
        let promiseArray = [];

        // Set 'updating' class for dropzone element
        toggleDropzoneClass($dropZone, "updating");

        // Loop over all of the passed-in files, and handle them based on input_field_settings
        for (const element of files) {
            const file = element;

            // Returns either an error message (string), or true (boolean)
            let isValid = isFileValid(file, input_field_settings);

            // Sanitise File Name for UI display purposes
            let sanitisedFileName = sanitiseAndValidateFileName(file.name);

            // Create a new File object with the sanitised filename while preserving the content and other properties
            const sanitisedFile = new File([file], sanitisedFileName, {
                type: file.type,
                lastModified: file.lastModified,
            });

            // Ensure that we carry over the custom properties (e.g., `id`) from the original file
            file.id = file.id !== undefined ? file.id : sanitisedFileName;
            // file.name = sanitisedFileName;
            // console.log(sanitisedFile.id);

            // Pass the actual File object to the loadingTemplate function, not just the sanitised name
            let $fileInfo = loadingTemplate(sanitisedFile); // <-- Here we pass the sanitisedFile object
            // Append the file info box to the file preview list
            $fileList.appendChild($fileInfo);

            // If the file passes the validation rules
            if (isValid === true) {
                // If we're using the JS API to create file assets
                if (usingJsApi) {
                    promiseArray.push(uploadFileJsApi(sanitisedFile, $fileInfo, input_field_settings));
                } else {
                    // Push the sanitised File object into the files array (not the original file)
                    input_field_settings.files.push(sanitisedFile);
                    promiseArray.push(simulateFileUpload(sanitisedFile, $fileInfo));
                }
            } else {
                $fileInfo.replaceWith(errorTemplate(sanitisedFile, isValid));
            }
        }

        // Only update the FileList if the JS API isn't being used
        if (!usingJsApi) {
            // Default functionality for a file type input is to replace the current FileList with the newly selected file/s
            // This will override that for subsequent interactions with the file input, or clicking the cancel button.
            updateFileInputFileList(input_field_settings);
        }

        // Once all promises have resolved, remove the updating class, and validate the field
        try {
            await Promise.all(promiseArray);
        } catch (error) {
            console.error(error);
        } finally {
            // Remove 'updating' class from dropzone
            toggleDropzoneClass($dropZone, "updating");
            // Validate file input
            $(input_field_settings.input_element).valid();
        }
    };

    /**
     * Update the FileList for the file input
     *
     * @memberof module:fileUploads
     */
    const updateFileInputFileList = function (input_field_settings) {
        // We can't directly modify an existing populated FileList, because FileLists are read-only array-like structures (not an actual array)
        // We need to create a DataTransfer instance, and add all of the current files to it - then set that as the new input.files value
        const files = input_field_settings.files;
        const $inputField = input_field_settings.input_element;
        let dataTransfer = new DataTransfer();

        // Loop over each File object and add to the DataTransfer instance
        files.forEach(function (file) {
            dataTransfer.items.add(file);
        });
        // Set the input files value to the new 'array' of File objects
        $inputField.files = dataTransfer.files;
    };

    /**
     * Display the info box for selected/dropped files (when data-js-api is set to "false")
     *
     * @memberof module:fileUploads
     */
    const simulateFileUpload = function (file, $fileInfo) {
        return new Promise(function (resolve, reject) {
            // Quick setTimeout to simulate a file upload
            let success = successTemplate(file);
            let text = success.querySelector(".qld__form-file-info-status");
            let newText = success.querySelector(".qld__form-file-info-status").textContent.replace("successful", "complete");

            // Use successTemplate, but add different text since the file isn't actually uploaded until submission
            for (var i = 0; i < text.childNodes.length; i++) {
                var node = text.childNodes[i];

                // If it's the text node that contains the word 'successful'
                if (node.nodeType === Node.TEXT_NODE && node.textContent.includes("successful")) {
                    node.textContent = newText;
                }
            }
            // Remove --success class, and add --complete class
            success.classList.remove("qld__form-file--success");
            success.classList.add("qld__form-file--complete");
            // Add success template
            $fileInfo.replaceWith(success);
            resolve();
        });
    };

    /**
     * Initialise JS API
     *
     * @memberof module:fileUploads
     */
    const jsApi = function (key) {
        let options = new Array();
        options["key"] = key;
        let js_api = new Squiz_Matrix_API(options);

        return js_api;
    };

    /**
     * Upload selected file to matrix
     *
     * @memberof module:fileUploads
     */
    const uploadFileJsApi = async function (file, $fileInfo, input_field_settings) {
        const reader = new FileReader();
        const jsApi = input_field_settings.jsApi;
        let fileContent;

        // Base64 file data
        reader.readAsDataURL(file);
        // File reader
        reader.onload = function () {
            // Strip the file type declaration from the start of the string
            fileContent = reader.result.split(",")[1];
        };

        try {
            // Create new (empty) file asset
            let newFileAsset = await createFileAsset(file, input_field_settings);
            // JS API doesn't return proper error codes, so we have to check for the 'error' property name
            if (!newFileAsset.hasOwnProperty("error")) {
                // Update our new file asset with Base64 data (fileContent)
                let updatedFileAsset = await updateFileContents(newFileAsset, fileContent, input_field_settings);

                if (!updatedFileAsset.hasOwnProperty("error")) {
                    // Get new file asset attributes
                    let newFileInfo = await jsApi.getGeneral({ asset_id: updatedFileAsset.assetid, get_attributes: 1 });

                    if (!newFileInfo.hasOwnProperty("error")) {
                        // We need to set the size property here, because jsApi.getGeneral doesn't return the size for some asset types
                        newFileInfo.size = file.size;
                        const $success = successTemplate(newFileInfo);
                        // Replace file info box with success template
                        $fileInfo.replaceWith($success);
                        // Update the array of files stored in the data-files attribute
                        setFilesDataAttribute(input_field_settings, newFileInfo);

                        return newFileInfo;
                    } else {
                        if (newFileInfo.errorDetails.length > 0) {
                            let err = {};
                            err.error = newFileInfo.errorDetails[0];
                            throw err.error;
                        }
                    }
                } else {
                    throw updatedFileAsset.error;
                }
            } else {
                throw newFileAsset.error;
            }
        } catch (error) {
            const $error = errorTemplate(file, error);
            $fileInfo.replaceWith($error);
            return error;
        }
    };

    /**
     * Create empty file asset in matrix
     *
     * @memberof module:fileUploads
     */
    const createFileAsset = async function (file, input_field_settings) {
        // Asset id of create location
        const createLocation = input_field_settings.create_location;
        const assetType = getAssetType(file.type);
        const fileName = file.name;
        const jsApi = input_field_settings.jsApi;

        try {
            // Create new file asset
            const newFile = await jsApi.createFileAsset({
                parentID: createLocation,
                type_code: assetType.type,
                friendly_name: fileName,
                link_type: "SQ_LINK_TYPE_1",
            });

            // If there's no error property present in the response
            if (!newFile.hasOwnProperty("error")) {
                return newFile;
            } else {
                if (newFile.errorDetails.length > 0) {
                    let err = {};
                    err.error = newFile.errorDetails[0].includes("web path already exists") ? "Filename already in use. Please rename file before trying again." : newFile.errorDetails[0];
                    throw err;
                }
            }
        } catch (error) {
            return error;
        }
    };

    /**
     * Update an empty file asset with Base64 content
     *
     * @memberof module:fileUploads
     */
    const updateFileContents = async function (asset, fileContent, input_field_settings) {
        // Asset ID from JS API response
        const assetId = Object.keys(asset)[0];
        const jsApi = input_field_settings.jsApi;

        try {
            // Grab the locks for the asset
            let locks = await jsApi.acquireLock({
                asset_id: assetId,
                screen_name: "attributes",
                dependants_only: 0,
                force_acquire: 1,
            });
            // Update File Asset with the file contents
            let updatedFile = await jsApi.updateFileAssetContent({
                asset_id: assetId,
                content: fileContent,
            });

            if (!updatedFile.hasOwnProperty("error")) {
                return updatedFile;
            } else {
                if (updatedFile.errorDetails.length > 0) {
                    let err = {};
                    err.error = updatedFile.errorDetails[0];
                    throw err;
                }
            }
        } catch (error) {
            return error;
        }
    };

    // Display file info for existing
    const displayExistingFiles = async function () {
        const files = this.files.length ? this.files : [];
        const $fileInfoArea = this.file_list_element;
        const displayed = this.files_displayed;
        const usingJsApi = this.js_api_key !== undefined;
        const jsApi = this.jsApi;

        // Only attempt to retrieve files from Matrix if JS api is available, and this function hasn't already been called
        if (files.length > 0 && displayed !== true) {
            // Set' displayed' flag to prevent multiple calls
            this.files_displayed = true;
            // Loop through current file assets and retrieve their data
            if (fileUploads.jsApi !== null && usingJsApi) {
                for (let file of files) {
                    try {
                        // Get general details for each
                        // ex. { "id" : 321, "web_path" : 'https://google.com' }
                        let currentFile = await jsApi.getGeneral({
                            asset_id: JSON.parse(file).id,
                            get_attributes: 1,
                        });

                        if (currentFile.error === undefined) {
                            displayFile(currentFile, $fileInfoArea);
                        } else {
                            throw new Error("displayExistingFiles: Could not retrieve asset attributes.");
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            } else {
                if (files.length > 0) {
                    for (let file of files) {
                        // Pass stored file details
                        displayFile(file, $fileInfoArea);
                    }
                }
            }
        } else {
            console.log(`All exisiting files already displaying for #${this.id}`);
        }
    };

    // Display file info card
    const displayFile = function (file, $fileInfoArea) {
        const parsedFile = typeof file === "string" ? JSON.parse(file) : file;
        const $fileInfoBox = successTemplate(parsedFile);

        $fileInfoArea.appendChild($fileInfoBox);
    };

    /**
     * Set the files data attribute for a JS API driven file input
     *
     * @memberof module:fileUploads
     */
    const setFilesDataAttribute = function (input_field_settings, newFileInfo = null) {
        let files = input_field_settings.files;

        if (newFileInfo) {
            const fileObj = {
                id: newFileInfo.id,
                name: newFileInfo.name,
            };

            if (
                files.findIndex(function (file) {
                    return file.id === newFileInfo.id;
                }) === -1
            ) {
                // Push stringified object containing file assetid and name into files array
                files.push(JSON.stringify(fileObj));
            }
        }
        // Set files data attribute
        input_field_settings.input_element.dataset["files"] = JSON.stringify(files);
    };

    // Store fileUploads object globally
    QLD.fileUploads = fileUploads;

    window.addEventListener("DOMContentLoaded", function () {
        QLD.fileUploads.init();
    });
})();
