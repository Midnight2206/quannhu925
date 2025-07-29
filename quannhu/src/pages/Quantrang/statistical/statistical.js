import classNames from 'classnames/bind';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import style from './statistical.module.scss';
import httpRequest from '~/utils/httpRequest';
import Button from '~/components/Button';

const cx = classNames.bind(style);

function Statistical() {
    const [data, setData] = useState({});
    const [units, setUnits] = useState([]);
    const [dataKeys, setDataKeys] = useState([]);
    const [fieldDisplayMapping, setFieldDisplayMapping] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPercent, setShowPercent] = useState(false); // State để lưu kiểu hiển thị

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const year = params.get('year');

    useEffect(() => {
        const getData = async () => {
            try {
                setLoading(true);
                const res = await httpRequest.get(`quantrang/statistical?year=${year}`);
                setData(res.data.data || {});
                setUnits(res.data.units || []);
                setDataKeys(res.data.dataKeys || []);
                setFieldDisplayMapping(res.data.fieldDisplayMapping || []);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, [year]);

    if (loading) {
        return <div className={cx('loading')}>Loading data...</div>;
    }

    if (error) {
        return <div className={cx('error')}>{error}</div>;
    }

    return (
        <div className={cx('container')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}>THỐNG KÊ CẤP PHÁT QUÂN TRANG NĂM {year}</h1>
                <label>
                    <input
                        type="checkbox"
                        checked={showPercent}
                        onChange={() => setShowPercent(!showPercent)}
                    />
                    Hiển thị theo phần trăm
                </label>
                <Button primary to={'/quantrang'}>Trở lại</Button>
            </div>
            <div className={cx('body')}>
                <Table bordered responsive className={cx('table')}>
                    <thead>
                        <tr>
                            <th className={cx('first-column')}>ĐƠN VỊ</th>
                            {dataKeys.map((dataKey, index) => (
                                <th key={index} className={cx('main-column')}>
                                    {fieldDisplayMapping?.[dataKey] ?? dataKey}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {units.length > 0 ? (
                            units.map((unit) => (
                                <tr key={unit}>
                                    {unit === 'trungDoan' ? <td>Toàn Trung đoàn</td> : <td>{unit}</td>}
                                    {dataKeys.map((dataKey) => (
                                        <td key={dataKey}>
                                            {showPercent
                                                ? data[unit]?.[dataKey]?.percent !== undefined
                                                    ? `${data[unit][dataKey].percent}%`
                                                    : 'N/A'
                                                : data[unit]?.[dataKey]?.dispensation !== undefined &&
                                                  data[unit]?.[dataKey]?.criterion !== undefined
                                                ? `${data[unit][dataKey].dispensation} / ${data[unit][dataKey].criterion}`
                                                : 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={dataKeys.length + 1} className={cx('no-data')}>
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default Statistical;
