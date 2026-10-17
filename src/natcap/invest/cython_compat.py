# -*- coding: utf-8 -*-
"""Pure-Python compatibility shims for Cython modules used by natcap.invest.

The original InVEST ships 5 Cython extension modules compiled against
``pygeoprocessing`` and GDAL:

    - ``natcap.invest.sdr.sdr_core``            (sediment deposition)
    - ``natcap.invest.ndr.ndr_core``            (nutrient effective retention)
    - ``natcap.invest.scenic_quality.viewshed`` (Wang et al. viewshed)
    - ``natcap.invest.delineateit.delineateit_core``  (pour-point detection)
    - ``natcap.invest.recreation.out_of_core_quadtree``
    - ``natcap.invest.seasonal_water_yield.seasonal_water_yield_core``

These are *not* reproducible from source without GDAL + pygeoprocessing
headers + a C++ compiler, so this package ships pure-Python fallbacks
that raise a clear ``RuntimeError`` when the underlying algorithm is
actually invoked.  The model ``execute``/``validate`` entry points and
the ``MODEL_SPEC`` metadata are fully importable, so:

    ``invest list``          -> works
    ``invest validate ...``  -> works
    ``invest run ...``       -> raises a helpful error pointing at the
                               Workbench binary build or the upstream
                               ``natcap/invest`` conda recipe.

To get the real compiled modules, install the official package from
conda-forge::

    conda install -c conda-forge natcap.invest
"""
import logging

LOGGER = logging.getLogger('natcap.invest.cython_compat')


def _not_available(name):
    """Return a callable that raises when the real Cython routine is used."""
    def _stub(*args, **kwargs):
        raise RuntimeError(
            'The Cython routine %r is not available in this pure-Python '
            'build of invest-geee.  Install the full natcap.invest package '
            'from conda-forge (conda install -c conda-forge natcap.invest) '
            'to enable this algorithm.' % name)
    _stub.__name__ = name
    return _stub


def __getattr__(name):
    # allow ``from natcap.invest.cython_compat import sdr_core`` style access
    if name.endswith('_core') or name == 'viewshed':
        return _not_available(name)
    raise AttributeError('module has no attribute %r' % name)
