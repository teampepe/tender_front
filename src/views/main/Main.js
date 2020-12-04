import React from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import cookie from 'react-cookies'
import Plot from 'react-plotly.js';

import './Main.scss';
import HeaderView from '../../components/header/HeaderView';
import axios from 'axios';
import { Redirect } from 'react-router';
import Loader from '../../components/loader';

const MIN_DIMENSION = 32;

class Main extends React.PureComponent {
    blobData = null;
    state = {
        src: null,
        processing: false,
        status: '',
        showCropper: true,
        showItems: false,
        loadingItems: false,
        items: [],
        tenders: [],
        itemTypeSeleted: 1,
        crop: {
            unit: '%',
            aspect: 1,
        },
    };

    onSelectFile = e => {
        this.setState({showCropper: true, showItems: false});

        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () =>
                this.setState({ src: reader.result, status: 'Выбери нужную область:' })
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // If you setState the crop in here you should return false.
    onImageLoaded = image => {
        this.imageRef = image;
    };

    onCropComplete = crop => {
        this.makeClientCrop(crop);
    };

    onCropChange = (crop, percentCrop) => {
        // You could also use percentCrop:
        // this.setState({ crop: percentCrop });
        this.setState({ crop, processing: true });
    };

    async makeClientCrop(crop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = await this.getCroppedImg(
                this.imageRef,
                crop,
                'newFile.jpeg'
            );
            this.setState({ croppedImageUrl });
        }
    }

    getCroppedImg(image, crop, fileName) {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY,
        );

        if(crop.width < MIN_DIMENSION || crop.height < MIN_DIMENSION){
            this.setState({status: `Размер фото должен быть не меньше ${MIN_DIMENSION}x${MIN_DIMENSION}`})
        }

        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    //reject(new Error('Canvas is empty'));
                    console.error('Canvas is empty');
                    reject('canvas is empty');
                    return;
                }

                blob.name = fileName;
                this.blobData = blob;

                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve(this.fileUrl);

            }, 'image/jpeg');

        });
    }

    sendImageRequest = () => {
        try {


            this.setState({showCropper: false, showItems: true, loadingItems: true});

            axios.post('http://84.201.170.248:5000', this.blobData, {
                headers: {Authorization: "Bearer MTIzNA=="}
            }).then(response => {
                console.log('response', response)
                if (response.status === 200) {
                    this.setState({items: response.data.items, tenders: response.data.tenders});
                }
            }).catch(error => {
                console.log('error', error);
            }).finally(() => {
                this.setState({loadingItems: false});
            });
        } catch(err){
            alert(err);
        }
    };

    renderCroppedResult = () => {
        const { croppedImageUrl } = this.state;

        if(!croppedImageUrl){
            return null;
        }

        return (
            <div className="cropped-image-area">
                <img src={croppedImageUrl} />
                <div className="controls">
                    <div onClick={this.sendImageRequest} className="btn">ЗАГРУЗИТЬ</div>
                    <div className="btn">ДРУГОЕ ФОТО</div>
                </div>
            </div>
        );
    };

    renderCropper = () => {
        const { crop, src } = this.state;

        if(!src){
            return (
                <div className="photo-hint">Загрузите фото для поиска...</div>
            );
        }

        return (
            <div className="cropper">
                <div className="status">Выберите нужную область:</div>
                <ReactCrop
                    src={src}
                    crop={crop}
                    ruleOfThirds
                    onImageLoaded={this.onImageLoaded}
                    onComplete={this.onCropComplete}
                    onChange={this.onCropChange}
                />
            </div>
        );
    };


    renderHead = () => {
        return (
            <div className="head">
                <div className="content">
                    <div className="title">ПОИСК ЗАКУПОК</div>
                    <div className="controls">
                        <div className="file-picker">
                            <input id="upload-photo" type="file" accept="image/*" onChange={this.onSelectFile} />
                            <label htmlFor="upload-photo">
                                <div className="btn">ЗАГРУЗКА ФОТО</div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    renderCropperView = () => {
        if(!this.state.showCropper){
            return null;
        }

        return (
          <>
              {this.renderCropper()}
              {this.renderCroppedResult()}
          </>
        );
    };


    renderItemsView = () => {
        if(!this.state.showItems){
            return null;
        }

        if(this.state.loadingItems){
            return (
                <div className="loader">
                    <div className="loader-spinner">
                        <Loader />
                    </div>
                    <div className="loader-text">
                        Загрузка фото...
                    </div>
                </div>
            );
        }

        const firstItemTypeClass = this.state.itemTypeSeleted === 0 ? 'active' : '';
        const secondItemTypeClass = this.state.itemTypeSeleted === 1 ? 'active' : '';

        const renderItems = () => {
            if(this.state.itemTypeSeleted !== 1) return null;


            if(this.state.items.length === 0){
                return <div className="items">Не найдено</div>;
            }

            return (
                <div className="items">
                    {this.state.items.map((item, index) => {
                        return (
                            <div key={index} className="item">
                                <img src={item.img_url || 'http://84.201.170.248:5000/images/19592657.jpg'} className="photo" />
                                <table>
                                    <tbody>
                                    <tr>
                                        <td>Наименование:</td>
                                        <td>{item.name}</td>
                                    </tr>
                                    <tr>
                                        <td>Производитель:</td>
                                        <td>{item.producer}</td>
                                    </tr>
                                    <tr>
                                        <td>Тип:</td>
                                        <td>{item.product_type}</td>
                                    </tr>
                                    <tr>
                                        <td>Вес:</td>
                                        <td>{item.weight}</td>
                                    </tr>
                                    <tr>
                                        <td>Оферты:</td>
                                        <td>{item.offer}</td>
                                    </tr>
                                    <tr>
                                        <td>Контракты:</td>
                                        <td>{item.contracts}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            );
        };

        const avgArr = arr => arr.reduce((sum, item) => sum + item, 0) / arr.length;

        const renderTenders = () => {
            if(this.state.itemTypeSeleted !== 0) return null;

            if(this.state.tenders.every(tenders => tenders.length === 0)){
                return <div className="items">Не найдено</div>;
            }

            const names = this.state.tenders.filter(items => items.length).map(items => {
               return items.length ? items[0].item_name : '-';
            });

            const avgPrices = this.state.tenders.filter(items => items.length).map(items => {
                return avgArr(items.map(item => item.price_item))
            });

            return (
                <>
                    <Plot
                      style={{width: '100%', margin: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                      data={[
                          {
                              x: names,
                              y: avgPrices,
                              type: 'scatter',
                              mode: 'lines+markers',
                              marker: {color: 'red'},
                          },
                          {type: 'bar', x: names, y: avgPrices},
                      ]}
                      layout={{width: 900, height: 350, title: 'Средняя цена'}}
                    />
                    <div className="items">
                        {
                            this.state.tenders.map((tenders, index1) => {
                            return (
                                <>
                                    {tenders.map((tender, index2) => {
                                        return (
                                            <div key={`${index1}-${index2}`} className="item">
                                                <table>
                                                    <tbody>
                                                    <tr>
                                                        <td>Наименование:</td>
                                                        <td>{tender.item_name}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Стартовая цена:</td>
                                                        <td>{tender.start_price}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>ИНН</td>
                                                        <td>{tender.inn}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>КПП:</td>
                                                        <td>{tender.kpp}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>СТЕ:</td>
                                                        <td>{tender.ste_id}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Адрес:</td>
                                                        <td>{tender.address}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Количество:</td>
                                                        <td>{tender.qnt_items}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Цена:</td>
                                                        <td>{tender.price_item}</td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })}
                                </>
                                )
                            })
                        }
                    </div>
                </>
            );
        };

        return (
            <>
                <div className="switcher">
                    <div
                        className={['option', firstItemTypeClass].join(' ')}
                        onClick={() => this.setState({itemTypeSeleted: 0})}
                    >
                        ЗАКУПКИ
                    </div>
                    <div
                        className={['option', secondItemTypeClass].join(' ')}
                        onClick={() => this.setState({itemTypeSeleted: 1})}
                    >
                        ТОВАРЫ
                    </div>
                </div>

                {renderItems()}
                {renderTenders()}
            </>
        );
    };

    render() {
        const token = cookie.load('token');

        if(!token){
            return <Redirect to="/login" />
        }

        const removeToken = () => {
            cookie.remove('token');
            this.forceUpdate();
        };

        return (
            <>
                <HeaderView removeToken={removeToken} />
                <div className="main-view">
                    {this.renderHead()}
                    {this.renderCropperView()}
                    {this.renderItemsView()}
                </div>
            </>
        );
    }
}

export default Main;