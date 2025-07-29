import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import Table from 'react-bootstrap/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';

import styles from './temporarySaveList.module.scss';
import httpRequest from '~/utils/httpRequest';
import Button from '~/components/Button';

const cx = classNames.bind(styles);

function DecreaseTemporarySavesList() {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState({
        infoHeaders: [],
        sizeHeaders: [],
        otherInfoHeaders: [],
    });
    const [keys, setKeys] = useState({
        infoKeys: [],
        sizeKeys: [],
        otherInfoKeys: [],
    });
    const [editedRows, setEditedRows] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [serverError, setServerError] = useState(null);

    // Fetch data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await httpRequest.get('quantrang/decrease/temporarySave');
                setData(response.data.data);
                setHeaders({
                    infoHeaders: response.data.infoHeaders,
                    sizeHeaders: response.data.sizeHeaders,
                    otherInfoHeaders: response.data.otherInfoHeaders,
                });
                setKeys({
                    infoKeys: response.data.infoKeys,
                    sizeKeys: response.data.sizeKeys,
                    otherInfoKeys: response.data.otherInfoKeys,
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Lỗi khi tải dữ liệu');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Check if a row is valid for transfer
    const isRowValid = (row) => {
        const allKeys = [
            ...keys.infoKeys.map((key) => row.info?.[key]),
            ...keys.sizeKeys.map((key) => row.size?.[key]),
            ...keys.otherInfoKeys.map((key) => row.otherInfo?.[key]),
        ];
        return allKeys.every((value) => value !== undefined && value.trim() !== '');
    };

    // Handle edit action when user modifies cell content
    const handleEdit = (rowId, keyType, key, value) => {
        setEditedRows((prev) => {
            const updated = { ...prev };
            if (!updated[rowId]) updated[rowId] = {};
            if (!updated[rowId][keyType]) updated[rowId][keyType] = {};
            updated[rowId][keyType][key] = value;
            return updated;
        });
    };

    // Handle submit the updated row
    const handleSubmit = async (rowId) => {
        if (!editedRows[rowId]) {
            setServerError('Không có thay đổi nào để lưu.');
            return;
        }

        try {
            const response = await httpRequest.post('quantrang/decrease/temporarySave/update', {
                _id: rowId,
                changes: editedRows[rowId],
            });
            setServerError(null); // Reset lỗi nếu thành công
            alert(response.data.message || 'Cập nhật thành công!');
            setEditedRows((prev) => {
                const updated = { ...prev };
                delete updated[rowId];
                return updated;
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật dữ liệu';
            setServerError(errorMessage); // Lưu thông báo lỗi
            console.error('Error updating data:', errorMessage);
        }
    };

    // Handle transfer row to main list and remove from temporary saves
    const handleTransfer = async (row) => {
        try {
            const response = await httpRequest.post('quantrang/decrease', {year: row.otherInfo.toAnyYear, data: row });
            await httpRequest.delete('quantrang/decrease/temporarySave/remove', { data: { _id: row._id } });

            setServerError(null); // Reset lỗi nếu thành công
            alert(response.data.message || 'Chuyển dữ liệu thành công!');
            setData((prevData) => prevData.filter((item) => item._id !== row._id));
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi khi chuyển dữ liệu';
            setServerError(errorMessage); // Lưu thông báo lỗi
            console.error('Error transferring data:', errorMessage);
        }
    };

    // Display loading or error message
    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>Lỗi: {error}</div>;

    return (
        <div>
            <div className={cx('temp-header')}>
                <h1 className={cx('temp-title')}>DANH SÁCH QUÂN SỐ GIẢM LƯU TẠM</h1>

                {/* Hiển thị thông báo lỗi nếu có */}
                {serverError && <div className="alert alert-danger">{serverError}</div>}
                <Button primary to={'/quantrang/decrease/list'}>
                    Trở về
                </Button>
            </div>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        {headers.infoHeaders.map((header, index) => (
                            <th key={`info-header-${index}`} className={cx('temp-info-header')}>
                                {header}
                            </th>
                        ))}
                        {headers.sizeHeaders.map((header, index) => (
                            <th key={`size-header-${index}`} className={cx('temp-size-header')}>
                                {header}
                            </th>
                        ))}
                        {headers.otherInfoHeaders.map((header, index) => (
                            <th key={`other-header-${index}`} className={cx('temp-other-header')}>
                                {header}
                            </th>
                        ))}
                        <th className={cx('temp-actions-header')}>Sửa</th>
                        <th className={cx('temp-actions-header')}>Chuyển</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIndex) => (
                        <tr key={item._id || `row-${rowIndex}`}>
                            {/* Render info cells */}
                            {keys.infoKeys.map((key, i) => (
                                <td
                                    key={`info-cell-${rowIndex}-${i}`}
                                    className={cx('temp-info-cell')}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleEdit(item._id, 'info', key, e.target.innerText)}
                                >
                                    {item.info?.[key] || '-'}
                                </td>
                            ))}
                            {/* Render size cells */}
                            {keys.sizeKeys.map((key, i) => (
                                <td
                                    key={`size-cell-${rowIndex}-${i}`}
                                    className={cx('temp-size-cell')}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleEdit(item._id, 'size', key, e.target.innerText)}
                                >
                                    {item.size?.[key] || '-'}
                                </td>
                            ))}
                            {/* Render other info cells */}
                            {keys.otherInfoKeys.map((key, i) => (
                                <td
                                    key={`other-cell-${rowIndex}-${i}`}
                                    className={cx('temp-other-cell')}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => handleEdit(item._id, 'otherInfo', key, e.target.innerText)}
                                >
                                    {item.otherInfo?.[key] || '-'}
                                </td>
                            ))}
                            {/* Submit button */}
                            <td className={cx('temp-actions-cell')}>
                                <FontAwesomeIcon
                                    icon={faSave}
                                    onClick={() => handleSubmit(item._id)}
                                    className={cx('temp-submit-icon')}
                                />
                            </td>
                            {/* Transfer button */}
                            <td className={cx('temp-actions-cell')}>
                                <button
                                    onClick={() => handleTransfer(item)}
                                    disabled={!isRowValid(item)}
                                    className={cx('temp-transfer-button', {
                                        disabled: !isRowValid(item),
                                    })}
                                >
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default DecreaseTemporarySavesList;
