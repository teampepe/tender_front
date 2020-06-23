import React from 'react';
import MosLogo from '../../assets/images/mos_logo.png';
import TenderLogo from '../../assets/images/tender_logo.png';
import SquaresImg from '../../assets/images/squares.svg';
import SharingImg from '../../assets/images/sharing.svg';

import BurgerLogo from '../../assets/images/burger.svg';
import PPLogo from '../../assets/images/pp_logo.svg';
import LogoutIcon from '../../assets/images/logout.svg';
import cookie from 'react-cookies';

import './HeaderView.scss';

class HeaderView extends React.PureComponent {
    render(){
        const renderLogout = () => {
            const token = cookie.load('token');

            if(token){
                return <img onClick={this.props.removeToken} className="logout" src={LogoutIcon} />;
            }

            return null;
        };

        return (
            <div className="header">
                <div className="top">
                    <div className="content">
                        <div className="logos">
                            <div className="item">
                                <img className="logo" src={MosLogo} />
                                <div className="description">Правительство<br />Москвы</div>
                            </div>
                            <div className="item">
                                <img className="logo" src={TenderLogo} />
                                <div className="description">Департамент города Москвы<br />по конкурентной политике</div>
                            </div>
                        </div>
                        <div className="controls">
                            <img className="button" src={SharingImg} />
                            <img className="button" src={SquaresImg} />
                        </div>
                    </div>
                </div>
                <div className="bottom">
                    <div className="content">
                        <div className="logos">
                            <img className="burger" src={BurgerLogo} />
                            <img className="logo" src={PPLogo} />
                        </div>
                        <div className="controls">
                            {renderLogout()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default HeaderView;