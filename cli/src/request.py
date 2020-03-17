import json
import requests
import os

class FileStorageRequest:
    @classmethod
    def get(cls, url, headers = {}):
        return cls._requests().get(url = url, headers = headers).json()

    @classmethod
    def download(cls, url, outdir = "", headers = {}):
        res = cls._requests().get(url, headers = headers)

        content_type = res.headers['Content-Type']
        content_disposition = res.headers['Content-Disposition']
        ATTRIBUTE = 'filename='
        filename = content_disposition[content_disposition.find(ATTRIBUTE) + len(ATTRIBUTE):][1:][:-1]

        outdir = os.path.realpath(outdir)
        try:
            os.makedirs(outdir)
        except Exception:
            pass
        filepath = os.path.join(outdir, filename)
        with open(filepath, 'wb') as file:
            file.write(res.content)
            return (True, filepath)
        return (False, "")

    @classmethod
    def post(cls, url, body, headers = {}):
        return cls._with_json(url, body, headers, "POST")

    @classmethod
    def delete(cls, url, body, headers = {}):
        return cls._with_json(url, body, headers, "DELETE")

    @classmethod
    def file(cls, url, file):
        req = cls._requests().post(url, files = file)
        return req.json()

    @classmethod
    def _with_json(cls, url, body, headers, method):
        req = getattr(cls._requests(), method.lower())(url, data = json.dumps(body).encode(), headers = headers)
        return req.json()

    @classmethod
    def _requests(cls):
        return requests
        
        
class FileStorageRequestException(requests.exceptions.RequestException):
    """Class for cache all requests error. DO NOT INSTANTIATE DIRECTLY"""
    pass
