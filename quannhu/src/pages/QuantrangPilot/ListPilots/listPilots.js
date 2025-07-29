import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import classNames from 'classnames/bind';
import style from './listPilots.module.scss';
import Button from '~/components/Button';
import httpRequest from '~/utils/httpRequest';

const cx = classNames.bind(style);

function ListPilots() {
    const navigate = useNavigate();
    const [selectedYearPilots, setSelectedYearPilots] = useState(() => localStorage.getItem('selectedYearPilots') || '2024');
    const [years, setYears] = useState([]);
    const [infoKeys, setInfoKeys] = useState([]);
    const [sizeKeys, setSizeKeys] = useState([]);
    const [dataKeys, setDataKeys] = useState([]);
    const [listDatas, setListDatas] = useState([]);
    const [infoHeaders, setInfoHeaders] = useState([]);
    const [sizeHeaders, setSizeHeaders] = useState([]);
    const [dataHeaders, setDataHeaders] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        localStorage.setItem('selectedYearPilots', selectedYearPilots);
    }, [selectedYearPilots]);

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await httpRequest.get('/pilots', { params: { year: selectedYearPilots } });
                setInfoKeys(res.data.infoKeys || []);
                setSizeKeys(res.data.sizeKeys || []);
                setDataKeys(res.data.dataKeys || []);
                setInfoHeaders(res.data.infoHeaders || []);
                setSizeHeaders(res.data.sizeHeaders || []);
                setDataHeaders(res.data.dataHeaders || []);
                setYears(res.data.years || []);
                setListDatas(res.data.listDatas || []);
                setError(null);
            } catch (error) {
                console.error('Lỗi tải dữ liệu:', error);
                setError('Không thể tải dữ liệu');
            }
        };
        getData();
    }, [selectedYearPilots]);

    const handleYearChange = (event) => {
        setSelectedYearPilots(event.target.value);
    };

    const handleOnClickRow = (id) => {
        navigate(`/pilots/individual/${id}`, { state: { year: selectedYearPilots } });
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <div className={cx('choose-year')}>
                    <label htmlFor="year">Năm:</label>
                    <select id="year" value={selectedYearPilots} onChange={handleYearChange}>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                <div className={cx('action')}>
                    <Button primary to={`/pilots/statistical?year=${selectedYearPilots}`}>Thống kê</Button>
                    <Button primary to={`/pilots/import`}>Import</Button>
                </div>
            </div>

            <div className={cx('body')}>
                <h3>DANH SÁCH PHI CÔNG, CÁN BỘ, NHÂN VIÊN DÙ {selectedYearPilots}</h3>
                {error ? (
                    <p className={cx('error')}>{error}</p>
                ) : (
                    <Table hover bordered responsive className={cx('table')}>
                        <thead>
                            <tr>
                                <th className={cx('info')}>#</th>
                                {infoHeaders.map((header) => <th key={header} className={cx('info')}>{header}</th>)}
                                {sizeHeaders.map((header) => <th key={header} className={cx('size')}>{header}</th>)}
                                {dataHeaders.map((header) => <th key={header} className={cx('data')}>{header}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {listDatas.map((listData, i) => (
                                <tr key={listData._id} onClick={() => handleOnClickRow(listData.info.ID)}>
                                    <td className={cx('info')}>{i + 1}</td>
                                    {infoKeys.map((key) => <td key={key} className={cx('info')}>{listData.info[key]}</td>)}
                                    {sizeKeys.map((key) => <td key={key} className={cx('size')}>{listData.size[key]}</td>)}
                                    {dataKeys.map((key) => <td key={key} className={cx('data')}>{listData.data[key]}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>
        </div>
    );
}

export default ListPilots;
