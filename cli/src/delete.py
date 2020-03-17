from src.request import FileStorageRequest, FileStorageRequestException

def delete(id):
    if id is None:
        raise RequiredArgumentsError("id is required")
    try:
        return FileStorageRequest.delete(f"http://localhost:8181/file/{id}", {'id': id})
    except FileStorageRequestException as e:
        print(e)
