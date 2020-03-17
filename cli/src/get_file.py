from src.request import FileStorageRequest, FileStorageRequestException

def get_file(id, outdir):
    try:
        result = FileStorageRequest.download(f"http://localhost:8181/file/{id}", outdir = outdir)
        if result[0]:
            return f"File saved in {result[1]}"
        else:
            return "Failed to download file"
    except FileStorageRequestException as e:
        print(e)
