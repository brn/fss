import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), './deps'))

import click
from tabulate import tabulate
from src.upload import upload as upload_file
from src.files import files as files
from src.delete import delete as delete_file
from src.get_file import get_file

@click.group(invoke_without_command=True)
@click.pass_context
def cli(ctx):
    if ctx.invoked_subcommand is None:
        print(ctx.get_help())

@cli.command(help='Upload file to server')
@click.option('--file', required=True, help="Path to file")
@click.option('--raw', is_flag=True, help="Output row json format")
def upload(file, raw):
    result = upload_file(file)
    if raw:
        print(result)
    else:
        print(tabulate([result], headers="keys", tablefmt="grid"))

@cli.command(help='Get uploaded file list')
@click.option('--raw', is_flag=True, help="Output row json format")
@click.option('--limit', type=int, default=100, help="Limit of files to display")
@click.option('--page', type=int, default=1, help="Offset of file list")
def list(raw, limit, page):
    result = files(limit, page)
    if raw:
        print(result)
    else:
        print(tabulate(result, headers="keys", tablefmt="grid"))

@cli.command(help='Get uploaded file list')
@click.option('--id', required=True, help="File id to delete")
@click.option('--raw', is_flag=True, help="Output fow json format")
def delete(id, raw):
    result = delete_file(id)
    if raw:
        print(result)
    else:
        print(tabulate([result], headers="keys", tablefmt="grid"))

@cli.command(help='Get a file content')
@click.option('--id', required=True, help="File id to download")
@click.option('--outdir', default=os.getcwd(), help="Output directory")
def get(id, outdir):
    print(get_file(id, outdir))

if __name__ == "__main__":
    cli()
