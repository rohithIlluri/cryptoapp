import React, { useState } from 'react'
import millify from 'millify';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Input} from 'antd';

import { useGetCryptosQuery } from '../services/cryptoApi';

const   Cryptocurrencies = () => {
    const { data: cryptosList, isFetching } = useGetCryptosQuery();
    const [cryptos, setCryptos] = useState(cryptosList?.data?.coins);
    console.log(cryptos)


    return(
       <>
       <Row gutters={[32,32]} className="crypto-card-container">
           {cryptos.map((currency) => (
               <col xs={24} sm={12} lg={6} className="crypto-card" key={currency.id}>
                   <Link to={`/crypto/${currency.id}`}>
                       <Card 
                       title={`${currency.rank}.${currency.name}`}
                       extra={<img className="crypto-image" src={currency.iconUrl}/>}
                       hoverable
                       >
                           <p>Price: {currency.price}</p>
                           <p>Market Cap: {currency.marketCap}</p>
                           <p>Daily Change: {currency.change}</p>
                       </Card>
                   </Link>
               </col>
           ))}
       </Row>
       </>
    )
}

export default Cryptocurrencies
