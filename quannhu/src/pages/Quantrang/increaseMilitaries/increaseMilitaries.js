import classNames from 'classnames/bind';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import unorm from 'unorm';
import { Modal, Button as BootstrapButton } from 'react-bootstrap';

import style from './increaseMilitaries.module.scss';
import Button from '~/components/Button';
import httpRequest from '~/utils/httpRequest';

const cx = classNames.bind(style);

function IncreaseMilitaries() {
    const [inputData, setInputData] = useState({
        "info": {
            "fullName": "",
            "gender": "",
            "rank": "",
            "unit": "",
            "PHCDD": "",
            "lotteryNumber": ""
        },
        "size": {
            "uniform": "",
            "hat": "",
            "shoe": "",
            "mat": "",
            "duaration": ""
        },
        "otherInfo": {
            "tranferFrom": "",
            "moveInTime": "",
            "fromAnyYear": "",
            "bookSubmitter": "",
            "dateOfSubmission": ""
        }
    } );
    const [infoKeys, setInfoKeys] = useState([]);
    const [sizeKeys, setSizeKeys] = useState([]);
    const [otherInfoKeys, setOtherInfoKeys] = useState([]);
    const [infoHeaders, setInfoHeaders] = useState([]);
    const [sizeHeaders, setSizeHeaders] = useState([]);
    const [otherInfoHeaders, setOtherInfoHeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('success'); // success hoặc error

    const isFormValid =
        Object.values(inputData.info).length > 0 &&
        Object.values(inputData.size).length > 0 &&
        Object.values(inputData.otherInfo).length > 0 &&
        Object.values(inputData.info).every((value) => (value || '').trim() !== '') &&
        Object.values(inputData.size).every((value) => (value || '').trim() !== '') &&
        Object.values(inputData.otherInfo).every((value) => (value || '').trim() !== '');

    const isTemporarySaveValid =
        Object.values(inputData.info).some((value) => (value || '').trim() !== '') ||
        Object.values(inputData.size).some((value) => (value || '').trim() !== '') ||
        Object.values(inputData.otherInfo).some((value) => (value || '').trim() !== '');

    const handleOnChangeInput = (field, e) => {
        const { name, value } = e.target;
        setInputData((prevData) => ({
            ...prevData,
            [field]: {
                ...prevData[field],
                [name]: value,
            },
        }));
    };

    const handleClickOKBtn = async () => {
        try {
            setLoading(true);
            const normalizedData = JSON.parse(unorm.nfc(JSON.stringify(inputData)));
            await httpRequest.post('quantrang/increase', { data: normalizedData });
            setModalMessage('Dữ liệu đã được gửi thành công!');
            setModalType('success');
            setInputData({ info: {}, size: {}, otherInfo: {} });
        } catch (error) {
            const errorMessage =
                error.response?.status === 501 ? error.response.data.message : 'Có lỗi xảy ra! Vui lòng thử lại.';
            setModalMessage(errorMessage);
            setModalType('error');
        } finally {
            setLoading(false);
            setShowModal(true);
        }
    };

    const handleTemporarySave = async () => {
        try {
            setLoading(true);
            const normalizedData = JSON.parse(unorm.nfc(JSON.stringify(inputData)));
            await httpRequest.post('quantrang/increase/temporarySave', { data: normalizedData });
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

    const getData = async () => {
        try {
            setLoading(true);
            const res = await httpRequest.get('quantrang/increase');
            setInfoKeys(res.data.infoKeys);
            setSizeKeys(res.data.sizeKeys);
            setOtherInfoKeys(res.data.otherInfoKeys);
            setInfoHeaders(res.data.infoHeaders);
            setSizeHeaders(res.data.sizeHeaders);
            setOtherInfoHeaders(res.data.otherInfoHeaders);
        } catch {
            setModalMessage('Không thể tải dữ liệu! Vui lòng thử lại sau.');
            setModalType('error');
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const handleCloseModal = () => setShowModal(false);
    console.log(inputData);
    return (
        <div className={cx('wrapper')}>
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

            <h1 className={cx('title')}>QUÂN SỐ TĂNG TRONG NĂM</h1>
            <p className={cx('description')}>
                * Vui lòng nhập thông tin vào tất cả các ô. Nếu thông tin chưa đầy đủ bạn có thể Click và nút Lưu tạm.
            </p>

            <form className={cx('header')}>
                {[infoKeys, sizeKeys, otherInfoKeys].map((keys, colIndex) => (
                    <div key={colIndex} className={cx('column')}>
                        {keys.map((key, index) => (
                            <div key={index} className={cx('info-element')}>
                                <label className={cx('label-info')}>
                                    {[infoHeaders, sizeHeaders, otherInfoHeaders][colIndex][index]}:
                                </label>
                                <input
                                    name={key}
                                    value={inputData[['info', 'size', 'otherInfo'][colIndex]][key] || ''}
                                    onChange={(e) => handleOnChangeInput(['info', 'size', 'otherInfo'][colIndex], e)}
                                    className={cx('input-info')}
                                    placeholder={[infoHeaders, sizeHeaders, otherInfoHeaders][colIndex][index]}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </form>

            <div className={cx('action')}>
                <Button primary onClick={handleClickOKBtn} disabled={!isFormValid || loading}>
                    {loading ? 'Đang xử lý...' : 'OK'}
                </Button>
                <Button primary onClick={handleTemporarySave} disabled={!isTemporarySaveValid || loading}>
                    {loading ? 'Đang lưu tạm...' : 'Lưu tạm'}
                </Button>
                <Button to="/quantrang/increase/list" primary>
                    Danh sách tăng
                </Button>
                <Button primary to="/quantrang/increase/temporarySave/list">
                    DS Lưu tạm
                </Button>
                <Button primary to="/quantrang">
                    Trở lại
                </Button>
            </div>
        </div>
    );
}

export default IncreaseMilitaries;
