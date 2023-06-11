import styles from "../styles/filter.module.css";
import priceStyle from "../styles/card.module.css";
import {ReactComponent as Moto} from "../styles/imgs/moto.svg";
import {ReactComponent as Tractor} from "../styles/imgs/tractor.svg";
import {ReactComponent as Car} from "../styles/imgs/car.svg";
import React, {useCallback, useEffect, useState} from "react";
import {api, Dropdown, DropdownWithCheckbox, DropdownWithCheckboxWithObject} from "./body";
import {currencyStyles} from "./card";
import {ICategory, IManufacturer} from "../../api/model";


const active = {
    borderBottomStyle: "solid",
    borderBottomColor: "#FD4100",
    borderLeft: 0,
    borderRight: 0,
    borderTop: 0,
    borderWidth: "0.1px",
    backgroundColor: "white"
}

const carStyle = {
    borderRadius: "11px 0 0 0",
}

const tractorStyle = {
    borderRadius: "0 0 0 0",
}

const motoStyle = {
    borderRadius: "0 11px 0 0",
}

export const saleOptions = ["იყიდება", "ქირავდება"]

const getYearList = () => {
    let arr = [];
    for (let i = 1900; i <= 2023; i++) {
        arr.push(i);
    }
    return arr.reverse();
}

export const Filter = React.memo(({
                                      showUSD,
                                      setShowUSD,
                                      mans,
                                      cats,
                                      handleSearch,
                                      setFilter
                                  }: {
    showUSD: boolean, setShowUSD: React.Dispatch<React.SetStateAction<boolean>>,
    setFilter: React.Dispatch<React.SetStateAction<string>>, cats: ICategory[],
    mans: IManufacturer[], handleSearch: ({filterQuery}: { filterQuery: string }) => void
}) => {
    const [isCar, setCar] = useState(true)
    const [isTractor, setTractor] = useState(false)
    const [isMoto, setMoto] = useState(false)
    const [sale, setSale] = useState("");
    const [model, setModel] = useState<any>("");
    const [cat, setCat] = useState("");
    const [man, setMan] = useState("")
    const [min, setMin] = useState()
    const [max, setMax] = useState()
    const [fromYear, setFromYear] = useState()
    const [toYear, setToYear] = useState()
    const [models, setModels] = useState<{ label: string, value: string, parent: string }[]>([])

    const handleSwitchCar = useCallback(() => {
        setCar(true);
        setMoto(false);
        setTractor(false);
    }, [])

    const handleSwitchTractor = useCallback(() => {
        setCar(false);
        setMoto(false);
        setTractor(true);
    }, [])

    const handleSwitchMoto = useCallback(() => {
        setCar(false);
        setMoto(true);
        setTractor(false);
    }, [])

    const handleMinChange = useCallback((e: any) => {
        if (
            (!isNaN(e.target.value) && !isNaN(parseFloat(e.target.value))) ||
            e.target.value === ''
        ) {
            setMin(e.target.value);
        }
    }, []);

    const handleMaxChange = useCallback((e: any) => {
        if (
            (!isNaN(e.target.value) && !isNaN(parseFloat(e.target.value))) ||
            e.target.value === ''
        ) {
            setMax(e.target.value);
        }
    }, []);

    const handleSearchButton = useCallback(() => {
        let catIds = [];
        let manIds: string[] = [];
        let query = '';
        if (sale.length !== 0) {
            query += `ForRent=${sale === 'ქირავდება' ? 1 : 0}`;
        }
        if (cat.length !== 0) {
            catIds = cats
                .filter((x) => cat.includes(x.title))
                .map((x) => x.category_id);
            if (catIds.length > 0) {
                query += `${query.length === 0 ? '' : '&'}Cats=${catIds.join('.')}`;
            }
        }
        if (man.length !== 0) {
            manIds = mans
                .filter((x) => man.includes(x.man_name))
                .map((x) => x.man_id);
            if (manIds.length > 0) {
                query += `${query.length !== 0 ? '&' : ''}Mans=`;
                if (model.length > 0) {
                    for (let i = 0; i < manIds.length; i++) {
                        query +=
                            `${i === 0 ? '' : '-'}${manIds[i]}.` +
                            model
                                .filter((m: any) => m.parent === manIds[i])
                                .map((x: any) => x.value)
                                .join('.');
                        if (query[query.length - 1] === '.') {
                            query = query.substring(0, query.length - 1);
                        }
                    }
                } else {
                    query += `${manIds.join('-')}`;
                }
            }
            if (query[query.length - 1] === '.') {
                query = query.substring(0, query.length - 1);
            }
        }

        if (min) {
            query += `${query.length !== 0 ? '&' : ''}PriceFrom=${min}`;
        }

        if (max) {
            query += `${query.length !== 0 ? '&' : ''}PriceTo=${max}`;
        }

        if (fromYear) {
            query += `${query.length !== 0 ? '&' : ''}ProdYearFrom=${fromYear}`;
        }

        if (toYear) {
            query += `${query.length !== 0 ? '&' : ''}ProdYearTo=${toYear}`;
        }

        query += `${
            query.length !== 0 ? '&' : ''
        }CurrencyID=${showUSD ? '1' : '3'}`;

        setFilter(query)
        handleSearch({filterQuery: query});
    }, [cat, cats, fromYear, handleSearch, man, mans, max, min, model, sale, setFilter, showUSD, toYear])

    useEffect(() => {
        const mansIds = mans.filter(x => man.includes(x.man_name)).map(x => x.man_id);
        if (mansIds.length === 0) setModels([])
        const ms: { label: string, value: string, parent: string }[] = [];
        for (const id of mansIds) {
            api.fetchModelsByManufacturerId(id).then(x => {
                x.forEach(t => ms.push({label: t.model_name, value: t.model_id + "", parent: t.man_id + ""}))
            })
        }
        setModels(ms)
    }, [man, mans])


    return (
        <div className={styles.body}>
            <div className={styles.items}>
            <span className={"active"} style={isCar ? {...carStyle, ...active} : {...carStyle} as any}
                  onClick={handleSwitchCar}>
                <Car fill={isCar ? "#FD4100" : "#8C929B"}/>
            </span>
                <span style={isTractor ? {...tractorStyle, ...active} : {...tractorStyle} as any}
                      onClick={handleSwitchTractor}>
                <Tractor fill={isTractor ? "#FD4100" : "#8C929B"}/>
            </span>
                <span className={"me"}
                      style={isMoto ? {...motoStyle, ...active} : {borderRightStyle: "none", ...motoStyle} as any}
                      onClick={handleSwitchMoto}>
                <Moto fill={isMoto ? "#FD4100" : "#8C929B"}/>
            </span>
            </div>

            <div className={styles.bottomFilter}>

                <div className={styles.dealType}>
                    <span className={styles.dealTitle} style={{fontWeight: "bold"}}>გარიგების ტიპი</span>
                    <DropdownWithCheckbox
                        title={"გარიგების ტიპი"} items={saleOptions} width={202} height={30} val={sale}
                        setItem={setSale} style={{
                        float: "left",
                        marginTop: 8,
                        fontSize: 13,
                        border: "1px solid #d2d1d1",
                        textAlign: "left",
                        multi: false
                    }}
                    />
                </div>

                <div className={styles.dealType}>
                    <span className={styles.dealTitle} style={{fontWeight: "bold"}}>მწარმოებელი</span>
                    <DropdownWithCheckbox
                        title={"ყველა მწარმოებელი"} items={mans.map(x => x.man_name)} width={202} height={30} val={man}
                        setItem={setMan} style={{
                        float: "left",
                        marginTop: 8,
                        fontSize: 12,
                        textAlign: "left",
                        border: "1px solid #d2d1d1",
                        color: "#6F7383 !important"
                    }}
                    />
                </div>
                <div className={styles.dealType}>
                    <span className={styles.dealTitle} style={{fontWeight: "bold"}}>მოდელი</span>
                    <DropdownWithCheckboxWithObject
                        title={"მანქანის მოდელები"} items={models} width={202} height={30}
                        val={model}
                        setItem={setModel} style={{
                        float: "left",
                        marginTop: 8,
                        fontSize: 12,
                        border: "1px solid #d2d1d1",
                        textAlign: "left",
                        color: "#6F7383 !important"
                    }}
                    />
                </div>
                <div className={styles.dealType}>
                    <span className={styles.dealTitle} style={{fontWeight: "bold"}}>კატეგორია</span>
                    <DropdownWithCheckbox
                        title={"ყველა კატეგორია"} items={cats.map(x => x.title)} width={202} height={30} val={cat}
                        setItem={setCat} style={{
                        float: "left",
                        marginTop: 8,
                        fontSize: 12,
                        border: "1px solid #d2d1d1",
                        textAlign: "left",
                        color: "#6F7383 !important"
                    }}
                    />
                </div>

                <hr style={{marginTop: 15, marginBottom: 16, border: "solid 1px #E9E9F0",}}/>
                <div className={styles.priceDiv}>
                    <span className={styles.dealTitle} style={{fontWeight: "bold", display: "block"}}>ფასი</span>
                    <span className={priceStyle.price}
                          style={{float: "right", display: "inline-block", position: "absolute", top: -8, right: -10}}>
                        <span className={priceStyle.priceToggle} onClick={() => setShowUSD(prevState => !prevState)}>
                            {" "}
                            <span style={showUSD ? {
                                ...currencyStyles,
                                backgroundColor: "#F2F3F6",
                            } as any : {...currencyStyles, opacity: "0.4"}}>
                                <span style={{display: "inline-block", paddingTop: 3, transition: "1s"}}>$</span>
                            </span>
                            <span
                                style={!showUSD ? {
                                    ...currencyStyles,
                                    backgroundColor: "#F2F3F6"
                                } as any : {...currencyStyles, opacity: "0.4"}}>
                            <span style={{display: "inline-block", paddingTop: 3, transition: "1s"}}>₾</span>
                            </span>
                        </span>
                    </span>
                    <input
                        type={"text"} className={styles.min}
                        value={min} onChange={handleMinChange} placeholder={"დან"}/>
                    <span className={styles.separator}>-</span>
                    <input
                        type={"text"} className={styles.min}
                        value={max} onChange={handleMaxChange} placeholder={"მდე"}/>
                </div>

                <div className={styles.year}>
                    <span className={styles.dealTitle} style={{fontWeight: "bold", display: "block"}}>წელი</span>
                    <Dropdown title={"დან"} setItem={setFromYear} item={fromYear} items={getYearList()} width={20}
                              style={{fontSize: 12, width: 78, height: 40, fontWeight: "0 !important", float: "left"}}
                    />
                    <span className={styles.separator}>-</span>
                    <Dropdown title={"მდე"} setItem={setToYear} item={toYear} items={getYearList()} width={20}
                              style={{fontSize: 12, width: 78, height: 40, fontWeight: "0 !important", float: "right"}}
                    />
                </div>
                <button className={styles.search} onClick={handleSearchButton}>ძებნა</button>
            </div>
        </div>
    )
})





