import React, { useState } from 'react';
import unorm from 'unorm';
import { read, utils } from 'xlsx';
import httpRequest from '~/utils/httpRequest';
import classNames from 'classnames/bind';
import style from './importList.module.scss';
import Button from '~/components/Button';

const cx = classNames.bind(style);

// ✅ Component Modal hiển thị thông báo
const MessageModal = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className={cx('modal-overlay')}>
            <div className={cx('modal-content')}>
                <p>{message}</p>
                <Button primary onClick={onClose}>
                    Đóng
                </Button>
            </div>
        </div>
    );
};

function ImportDataFromExcel() {
    const [jsonData, setJsonData] = useState([]);
    const [year, setYear] = useState('');
    const [errData, setErrData] = useState([]);
    const [message, setMessage] = useState(null); // ✅ State cho thông báo modal

    // Xử lý khi chọn file
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const rows = utils.sheet_to_json(worksheet, { header: 1, defval: null });

            if (rows.length < 3) {
                setMessage('File Excel không có đủ dữ liệu.');
                return;
            }

            const keys = rows[1];
            const values = rows.slice(2).filter((row) => row.some((cell) => cell)); // Bỏ dòng trống

            const parsedData = values.map((row) =>
                keys.reduce((acc, key, index) => {
                    if (row[index]) acc[key] = typeof row[index] === 'string' ? unorm.nfc(row[index]) : row[index];
                    return acc;
                }, {}),
            );

            setJsonData(parsedData);
        };

        reader.readAsArrayBuffer(file);
    };

    // Xử lý thay đổi input năm
    const handleChangeInputYear = (e) => setYear(e.target.value);

    // Cập nhật lỗi
    const handleInputChange = (e, index) => {
        const { name, value } = e.target;
        setErrData((prev) => prev.map((item, i) => (i === index ? { ...item, [unorm.nfc(name)]: value } : item)));
    };

    // Gửi dữ liệu lên server
    const postData = async () => {
        if (!jsonData.length || !year.trim()) {
            setMessage('Vui lòng nhập đủ dữ liệu trước khi gửi.');
            return;
        }

        try {
            const res = await httpRequest.post('/pilots/import', { data: jsonData, year });
            setErrData(res.data);
            setJsonData([]);
            setYear('');
            setMessage('Import dữ liệu thành công!');
        } catch (error) {
            setMessage('Lỗi khi gửi dữ liệu: ' + (error.response?.data?.message || 'Lỗi không xác định.'));
        }
    };

    // Gửi lại dữ liệu lỗi
    const resendData = async () => {
        if (!errData.length || !year.trim()) {
            setMessage('Không có dữ liệu lỗi để gửi lại.');
            return;
        }

        try {
            const res = await httpRequest.patch('/pilots/add', { data: errData, year });
            setErrData(res.data);
            setMessage('Gửi lại dữ liệu thành công!');
        } catch (error) {
            setMessage('Lỗi khi gửi lại dữ liệu: ' + (error.response?.data?.message || 'Lỗi không xác định.'));
        }
    };

    return (
        <div className={cx('wrapper')}>
            <MessageModal message={message} onClose={() => setMessage(null)} /> {/* ✅ Hiển thị modal */}
            <div className={cx('title')}>
                <h1>IMPORT DANH SÁCH PHI CÔNG, DÙ NĂM</h1>
                <input className={cx('inputYear')} placeholder="Năm" onChange={handleChangeInputYear} value={year} />
                <Button primary to="/listPilots">
                    Trở lại
                </Button>
            </div>
            <div className={cx('body')}>
                <div className={cx('importFile')}>
                    <img className={cx('importFile-image')} src="/images/su27vn.jpg" alt="avatr" />
                    <div className='importFile-content'>
                      <input type="file" onChange={handleFileChange} />
                      <button className={cx('importButton')} onClick={postData}>
                          Import
                      </button>
                    </div>
                </div>

                {errData.length > 0 && (
                    <div className={cx('errorData')}>
                        <h1>Danh sách quân nhân trùng thông tin</h1>
                        {errData.map((errdt, i) => (
                            <div className={cx('wrapper-errdt')} key={i}>
                                <input
                                    className={cx('wrapper-errdt-input')}
                                    name="fullName"
                                    onChange={(e) => handleInputChange(e, i)}
                                    placeholder="Họ và tên"
                                    defaultValue={errdt.fullName}
                                />
                                {['rank', 'unit', 'PHCDD', 'gender'].map((field) => (
                                    <input
                                        key={field}
                                        className={cx('wrapper-errdt-input')}
                                        name={field}
                                        readOnly
                                        placeholder={field}
                                        defaultValue={errdt[field]}
                                    />
                                ))}
                            </div>
                        ))}
                        <Button primary onClick={resendData}>
                            Gửi lại
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImportDataFromExcel;
