from src.request import FileStorageRequest, FileStorageRequestException

def upload(filename):
    if filename is None:
        raise RequiredArgumentsError("FILENAME is required")
    try:
        with open(filename) as f:
            try:
                return FileStorageRequest.file("http://localhost:8181/upload", {'file': (filename, f)})
            except FileStorageRequestException as e:
                print(e)
    except Exception as e:
        print(e)
