from src.request import FileStorageRequest, FileStorageRequestException

def files(limit, page):
    try:
        return FileStorageRequest.get(f"http://localhost:8181/list?limit={limit}&offset={page}")
    except FileStorageRequestException as e:
        print(e)
