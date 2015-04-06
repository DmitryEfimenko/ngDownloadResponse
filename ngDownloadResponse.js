'use strict';

// Source: https://github.com/DmitryEfimenko/ngDownloadResponse

// directive allows to provide a function to be executed to get data to be downloaded
// attributes:
// download-response - Required. Function to get data. It must return a promise. It must be declared on the $scope.
// download-success - Optional. Function to be executed if download-response function was successfully resolved. It must be declared on the $scope.
// download-error - Optional. Function to be executed if download-response function return a promise rejection. It must be declared on the $scope.
// download-mime - Optional. provide a mime type of data being downloaded. Defaulted to "application/octet-stream"
// download-name - Optional. name of the file to download. Defaulted to "download.bin"
// download-backup-url - in case browser does not support dynamic download, this url will be called to get the file
angular.module('ngDownloadResponse')
    .directive('downloadResponse', ['$parse',
        function($parse) {

            function saveMethod1(data, filename, contentType) {
                // Support for saveBlob method (Currently only implemented in Internet Explorer as msSaveBlob, other extension in case of future adoption)
                var blob = new Blob([data], { type: contentType });

                if (navigator.msSaveBlob) {
                    // IE Save blob is supported, so get the blob as it's contentType and call save.
                    navigator.msSaveBlob(blob, filename);
                } else {
                    var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
                    if (saveBlob) {
                        // Non IE Save blob is supported, so get the blob as it's contentType and call save.
                        saveBlob(blob, filename);
                    } else {
                        throw 'saveBlob is not supported. Falling back to the next method';
                    }
                }
            }

            function saveMethod2(data, filename, contentType, octetStreamMime) {
                // Get the blob url creator
                var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
                if (urlCreator) {
                    // Try to use a download link
                    var link = document.createElement("a");
                    var url;
                    if ("download" in link) {
                        // Prepare a blob URL
                        var blob = new Blob([data], { type: contentType });
                        url = urlCreator.createObjectURL(blob);
                        link.setAttribute("href", url);

                        // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
                        link.setAttribute("download", filename);

                        // Simulate clicking the download link
                        var event = document.createEvent('MouseEvents');
                        event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                        link.dispatchEvent(event);

                        //console.log("Download link Success");
                    } else {
                        // Prepare a blob URL
                        // Use application/octet-stream when using window.location to force download
                        var blob = new Blob([data], { type: octetStreamMime });
                        url = urlCreator.createObjectURL(blob);
                        window.location = url;

                        //console.log("window.location Success");
                    }
                } else {
                    throw 'UrlCreator not supported. Falling back to the next method';
                }
            }

            function saveMethod3(attrs) {
                if (attrs.downloadBackupUrl && attrs.downloadBackupUrl != '') {
                    window.open('http://' + document.domain + attrs.downloadBackupUrl, '_blank');
                } else {
                    throw 'Could not download a file using any of the available methods. Also you did not provide a backup download link. No more bullets left...';
                }
            }

            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    var getDataHandler = $parse($attrs.downloadResponse);
                    $element.on('click', function() {
                        var promise = getDataHandler($scope);
                        promise.then(
                            function(data) {
                                if ($attrs.downloadSuccess && $attrs.downloadSuccess != '') {
                                    var successHandler = $parse($attrs.downloadSuccess);
                                    successHandler($scope);
                                }

                                var octetStreamMime = "application/octet-stream";

                                var filename = $attrs.downloadName || "download.bin";
                                var contentType = $attrs.downloadMime || octetStreamMime;


                                try {
                                    saveMethod1(data, filename, contentType);
                                    return;
                                } catch (e) {
                                    //console.log(e);
                                    try {
                                        saveMethod2(data, filename, contentType, octetStreamMime);
                                        return;
                                    } catch (e) {
                                        //console.log(e);
                                        try {
                                            saveMethod3($attrs);
                                            return;
                                        } catch (e) {
                                            //console.log(e);
                                            throw e;
                                        }
                                        throw e;
                                    }
                                    throw e;
                                }
                            },
                            function(data) {
                                if ($attrs.downloadError && $attrs.downloadError != '') {
                                    var errorHandler = $parse($attrs.downloadError);
                                    errorHandler($scope);
                                }
                            }
                        );
                    });
                }
            };
        }
    ]);
