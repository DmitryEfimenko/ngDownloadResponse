# ngDownloadResponse
Directive to allow downloading a file returned from the server

Installation:
-------------
*Reference module in your app*
```JavaScript
angular.module('app', ['ngDownloadResponse']);
```

Basic Example:
-------------
All you need to do is to apply directive to any html element that you want to trigger file downloading.
This directive should specify the name of the function that will return the file contents:
```HTML
<button download-response="getMyFile()">Get the File</button>
```
The `download-response` function need to be declared on the scope of the controller and it must return a promise:
```JavaScript
$scope.getMyFile = function () {
    return $http.post('/getMyFile', { id: 3 });
}
```

Additional Options:
-------------
You can customize behaviour by specifying extra attributes on the element:
```HTML
<button download-response="getData()"
        download-success="getDataSuccess()"
        download-error="getDataError()"
        download-name="{{name}}.pdf"
        download-mime="application/pdf"
        download-backup-url="/Backup/File.pdf">
    Save
</button>
```
**Explanation of options:**
* `download-response` - Required. Function to get data. It must return a promise. It must be declared on the $scope.
* `download-success` - Optional. Function to be executed if download-response function was successfully resolved. It must be declared on the $scope.
* `download-error` - Optional. Function to be executed if download-response function return a promise rejection. It must be declared on the $scope.
* `download-mime` - Optional. provide a mime type of data being downloaded. Defaulted to "application/octet-stream"
* `download-name` - Optional. name of the file to download. Defaulted to "download.bin"
* `download-backup-url` - in case browser does not support dynamic download, this url will be called to get the file

Credits:
-------------
This directive is written based on [Scott's answer on StackOverflow](http://stackoverflow.com/a/24129082/894273)
