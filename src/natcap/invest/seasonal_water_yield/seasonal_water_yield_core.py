# -*- coding: utf-8 -*-
"""Pure-Python fallback for the compiled Cython module ``seasonal_water_yield_core``.

Real module: ``natcap/invest/src/natcap/invest/seasonal_water_yield/seasonal_water_yield_core.pyx``.
Implements the MFD/D8 routing for local recharge and baseflow accumulation.
"""
from natcap.invest.cython_compat import _not_available


def calculate_local_recharge(
        precip_path_list, et0_path_list, qf_m_path_list, flow_dir_mfd_path,
        kc_path_list, alpha_month_map, beta_i, gamma, stream_path,
        target_li_path, target_li_avail_path, target_l_sum_avail_path,
        target_aet_path, target_pi_path, algorithm):
    """Calculate the rasters defined by equations [3]-[7] (stub)."""
    _not_available('seasonal_water_yield_core.calculate_local_recharge')(
        precip_path_list, et0_path_list, qf_m_path_list, flow_dir_mfd_path,
        kc_path_list, alpha_month_map, beta_i, gamma, stream_path,
        target_li_path, target_li_avail_path, target_l_sum_avail_path,
        target_aet_path, target_pi_path, algorithm)


def route_baseflow_sum(
        flow_dir_path, l_path, l_avail_path, l_sum_path,
        stream_path, target_b_path, target_b_sum_path, algorithm):
    """Route Baseflow through MFD as described in Equation 11 (stub)."""
    _not_available('seasonal_water_yield_core.route_baseflow_sum')(
        flow_dir_path, l_path, l_avail_path, l_sum_path,
        stream_path, target_b_path, target_b_sum_path, algorithm)
