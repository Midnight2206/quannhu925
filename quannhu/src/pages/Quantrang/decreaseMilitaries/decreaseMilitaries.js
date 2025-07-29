import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import unorm from 'unorm';
import { Modal, Button as BootstrapButton } from 'react-bootstrap';
import classNames from 'classnames/bind';
import httpRequest from '~/utils/httpRequest';
import Button from '~/components/Button';
import style from './decreaseMilitaries.module.scss';

const cx = classNames.bind(style);

function DecreaseMilitaries() {
    const [otherInfo, setOtherInfo] = useState({});
    const [sizeKeys, setSizeKeys] = useState([]);
    const [sizeHeaders, setSizeHeaders] = useState([]);
    const [otherInfoKeys, setOtherInfoKeys] = useState([]);
    const [otherInfoHeaders, setOtherInfoHeaders] = useState([]);
    const [infoKeys, setInfoKeys] = useState([]);
    const [infoHeaders, setInfoHeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('success');
    const location = useLocation();
    const { data } = location.state || {};

    useEffect(() => {
        const getData = async () => {
            try {
                const res = await httpRequest.get('quantrang/decrease');
                setSizeKeys(res.data.sizeKeys || []);
                setSizeHeaders(res.data.sizeHeaders || []);
                setOtherInfoKeys(res.data.otherInfoKeys || []);
                setOtherInfoHeaders(res.data.otherInfoHeaders || []);
                setInfoKeys(res.data.infoKeys || []);
                setInfoHeaders(res.data.infoHeaders || []);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
            }
        };
        getData();
    }, [location.state]);

    const handleOtherInfoChange = useCallback((key, value) => {
        setOtherInfo((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleSubmit = async () => {
        try {
            const decreaseData = {
                info: data.info,
                size: data.size,
                otherInfo,
            };

            const res = await httpRequest.post('quantrang/decrease', {
                year: data.year,
                data: decreaseData,
            });

            console.log('Gửi dữ liệu thành công:', res.data);
        } catch (error) {
            console.error('Lỗi khi gửi dữ liệu:', error);
        }
    };
    const handleTemporarySave = async () => {
        try {
            setLoading(true);
            const normalizedData = JSON.parse(
                unorm.nfc(JSON.stringify({ info: data.info, size: data.size, otherInfo })),
            );
            await httpRequest.post('quantrang/decrease/temporarySave', { data: normalizedData });
            setModalMessage('Dữ liệu đã được lưu tạm thành công!');
            setModalType('success');
        } catch (error) {
            const errorMessage =
                error.response?.status === 501
                    ? error.response.data.message
                    : 'Có lỗi xảy ra khi lưu tạm! Vui lòng thử lại.';
            setModalMessage(errorMessage);
            setModalType('error');
        } finally {
            setLoading(false);
            setShowModal(true);
        }
    };
    const handleCloseModal = () => setShowModal(false);
    // Kiểm tra tất cả các ô otherInfo đã được nhập đầy đủ hay chưa
    const isFormValid =
        otherInfoKeys.length > 0 && otherInfoKeys.every((key) => otherInfo[key] && otherInfo[key].trim() !== '');
    const isTemporarySaveValid =
        otherInfoKeys.length > 0 && otherInfoKeys.some((key) => otherInfo[key] && otherInfo[key].trim() !== '');
    return (
        <div>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalType === 'success' ? 'Thành công' : 'Lỗi'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{modalMessage}</p>
                </Modal.Body>
                <Modal.Footer>
                    <BootstrapButton variant="secondary" onClick={handleCloseModal}>
                        Đóng
                    </BootstrapButton>
                </Modal.Footer>
            </Modal>
            <h1>QUÂN SỐ GIẢM NĂM {data?.year}</h1>
            <form className={cx('header')}>
                <div className={cx('colunm')}>
                    {infoKeys.map((infoKey, index) => (
                        <div key={infoKey} className={cx('info-element')}>
                            <label className={cx('label-info')}>{infoHeaders[index]}: </label>
                            <input
                                defaultValue={data?.info?.[infoKey]}
                                className={cx('input-info', 'input-disabled')}
                                readOnly
                            />
                        </div>
                    ))}
                </div>
                <div className={cx('colunm')}>
                    {sizeKeys.map((sizeKey, index) => (
                        <div key={sizeKey} className={cx('info-element')}>
                            <label className={cx('label-info')}>{sizeHeaders[index]}: </label>
                            <input
                                defaultValue={data?.size?.[sizeKey]}
                                className={cx('input-info', 'input-disabled')}
                                readOnly
                            />
                        </div>
                    ))}
                </div>
                <div className={cx('colunm')}>
                    {otherInfoKeys.map((otherInfoKey, index) => (
                        <div key={otherInfoKey} className={cx('info-element')}>
                            <label className={cx('label-info')}>{otherInfoHeaders[index]}: </label>
                            <input
                                className={cx('input-info')}
                                value={otherInfo[otherInfoKey] || ''}
                                onChange={(e) => handleOtherInfoChange(otherInfoKey, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </form>
            <div className={cx('action')}>
                <Button primary onClick={handleSubmit} disabled={!isFormValid}>
                    OK
                </Button>
                <Button primary to={'/quantrang/decrease/list'}>
                    Danh sách giảm
                </Button>
                <Button primary onClick={handleTemporarySave} disabled={!isTemporarySaveValid || loading}>
                    {loading ? 'Đang lưu tạm...' : 'Lưu tạm'}
                </Button>
                <Button primary to={'/quantrang/decrease/temporarySave/list'}>
                    Danh sách lưu tạm
                </Button>
                <Button primary to={'/quantrang'}>
                    Trở về
                </Button>
            </div>
        </div>
    );
}

export default DecreaseMilitaries;
