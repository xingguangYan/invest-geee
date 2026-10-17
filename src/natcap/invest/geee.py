#!/usr/bin/env python3
"""GEE JavaScript port helper for InVEST.

This module provides a thin wrapper around the GEE JS port
(see ``gee_port/`` directory).  It is intended to be used from a
Python environment that has access to the GEE API (``earthengine-api``).

Usage:
    from natcap.invest.geee import run_model_on_gee
    result = run_model_on_gee('carbon', {'lulc_current': 'projects/.../lulc'})
"""
import json
import os
import subprocess
import sys
import tempfile


def _geee_js_path():
    """Return the absolute path to the gee_port directory."""
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(here, '..', '..', '..', 'gee_port'))


def generate_runner_script(model_id, args_dict, output_var='result'):
    """Generate a GEE JavaScript snippet that runs a model."""
    js_path = _geee_js_path()
    return (
        'var invest = require("%s/index.js");\n'
        'var args = %s;\n'
        'var %s = invest.models.%s.run(args);\n'
        'print("Model %s completed.");\n'
        'print("Outputs: " + JSON.stringify(Object.keys(%s.outputs)));\n'
    ) % (js_path.replace('\\', '/'),
         json.dumps(args_dict, indent=2),
         output_var, model_id, model_id, output_var)


def run_model_on_gee(model_id, args_dict, project=None):
    """Run an InVEST model on GEE via the JavaScript port.

    Args:
        model_id (str): Model identifier (e.g. 'carbon', 'annualWaterYield')
        args_dict (dict): Model arguments (ee.Image / ee.FeatureCollection
            references as strings)
        project (str, optional): GEE project name

    Returns:
        dict: Result summary with output keys
    """
    try:
        import ee
    except ImportError:
        print('earthengine-api is required. Install with: pip install earthengine-api')
        return None

    script = generate_runner_script(model_id, args_dict)

    # Write script to temp file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
        f.write(script)
        script_path = f.name

    try:
        # Initialize EE
        ee.Initialize()

        # Execute the script via Code Editor API
        # Note: GEE Code Editor doesn't have a direct "run script" API;
        # this is a placeholder for the actual execution flow.
        print('Script written to:', script_path)
        print('Please upload and run this script in GEE Code Editor.')
        print('Script content:')
        print(script)

        return {'status': 'script_generated', 'script_path': script_path}
    finally:
        # Clean up
        if os.path.exists(script_path):
            os.unlink(script_path)


def list_gee_models():
    """List all models available in the GEE JavaScript port."""
    js_path = _geee_js_path()
    models_path = os.path.join(js_path, 'src', 'models', 'index.js')
    if not os.path.exists(models_path):
        return []

    with open(models_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract model names from the exports
    import re
    matches = re.findall(r'exports\.(\w+) = (\w+);', content)
    return [m[0] for m in matches]


def main():
    """CLI entry point for GEE port."""
    import argparse
    parser = argparse.ArgumentParser(
        prog='invest-geee',
        description='Run InVEST models on Google Earth Engine',
    )
    sub = parser.add_subparsers(dest='command')

    p_list = sub.add_parser('list', help='List GEE models')
    p_list.set_defaults(func=lambda a: print(
        '\n'.join(list_gee_models())))

    p_run = sub.add_parser('run', help='Run a model on GEE')
    p_run.add_argument('model_id', help='Model identifier')
    p_run.add_argument('--args', help='JSON string of arguments')
    p_run.set_defaults(func=lambda a: run_model_on_gee(
        a.model_id, json.loads(a.args) if a.args else {}))

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return
    args.func(args)


if __name__ == '__main__':
    main()
