import {ICar, ICarModel, IManufacturer} from "../../api/model";
import React, {useEffect, useState} from "react";
import styles from "../styles/card.module.css";
import {ReactComponent as Engine} from "../styles/imgs/engine.svg";
import {ReactComponent as Shifter} from "../styles/imgs/shifter.svg";
import {ReactComponent as Speed} from "../styles/imgs/speed.svg";
import {ReactComponent as Steering} from "../styles/imgs/sache.svg";
import {ReactComponent as Done} from "../styles/imgs/done.svg";
import {ReactComponent as BottomIcons} from "../styles/imgs/icons.svg";
import {ReactComponent as Hot} from "../styles/imgs/hot.svg";
import {ReactComponent as Love} from "../styles/imgs/path.svg";
import alt from "../styles/imgs/alt.gif";
import {useWindowSize} from "@uidotdev/usehooks";


const gearTypes = [
    {id: 1, type: "მექანიკური"},
    {id: 2, type: "ავტომატიკა"},
    {id: 3, type: "ტიპტრონიკი"},
    {id: 4, type: "ვარიატორი"}
]

const fuelTypes = [
    {id: 2, type: "ბენზინი"},
    {id: 3, type: "დიზელი"},
    {id: 6, type: "ჰიბრიდი"},
    {id: 7, type: "ელექტრო"},
    {id: 8, type: "ბუნებრივი გაზი"},
    {id: 9, type: "თხევადი გაზი"},
    {id: 10, type: "დატ. ჰიბრიდი"},
    {id: 12, type: "წყალბადი"}
]

const getNormalizedDate = (datestr: string) => {
    const date = new Date(datestr);

    const minute = 60 * 1000
    const hour = minute * 60
    const day = hour * 24
    const month = day * 30
    const year = day * 365

    const now = new Date().getTime()
    const diff = now - date.getTime()

    if (diff < minute) {
        return 'ახლახანს'
    } else if (diff < hour) {
        const minutes = Math.round(diff / minute);
        return `${minutes} წუთის წინ`
    } else if (diff < day) {
        const hours = Math.round(diff / hour);
        return `${hours} საათის წინ`
    } else if (diff < month) {
        const days = Math.round(diff / day);
        return `${days} დღის წინ`
    } else if (diff < year) {
        const months = Math.round(diff / month);
        return `${months} თვის წინ`
    } else {
        const years = Math.round(diff / year);
        return `${years} წლის წინ`
    }
}
export const currencyStyles = {
    width: 28,
    height: 28,
    borderRadius: 16,
    display: "inline-block",
    textAlign: "center",
}

export const Card = React.memo<{ car: ICar, models: ICarModel[], mans: IManufacturer[], showUSD: boolean, setShowUSD: React.Dispatch<React.SetStateAction<boolean>> }>
(({car, models, mans, showUSD, setShowUSD}) => {

    const [model, setCarModel] = useState<ICarModel | undefined>()
    const [man, setMan] = useState<IManufacturer | undefined>()
    const width = useWindowSize()

    useEffect(() => {
        const modelsJson = localStorage.getItem("models");

        if (modelsJson !== null && JSON.parse(modelsJson).length > 0) {
            const parsed = JSON.parse(modelsJson).flatMap((x: any) => x) as ICarModel[];
            setCarModel(parsed.find(m => m.model_id === car.model_id))
        } else {
            setCarModel(models.find(m => m.model_id === car.model_id))
        }
        setMan(mans.find(m => m.man_id === car.man_id + ""))
    }, [car.man_id, car.model_id, mans, models])

    if (!car || !models || !mans) {
        return <div style={{
            position: "absolute",
            background: `url(https://i.gifer.com/7YQl.gif)`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover"
        }} className={styles.card}>
        </div>
    }

    return (
        <div className={styles.card}>
            {car && (
                <React.Fragment>
                    {width.width <= 800 &&
                        <Love style={{
                            position: "absolute", right: 25, height: 20, fill: "orange",
                            width: 30, top: 120, zIndex: 900, cursor: "pointer"
                        }}/>
                    }
                    <img
                        src={`https://static.my.ge/myauto/photos/${car.photo}/thumbs/${car.car_id}_1.jpg?v=${car.photo_ver}`}
                        className={`${styles.photo} selected`}
                        onError={({currentTarget}) => {
                            currentTarget.onerror = null;
                            currentTarget.src = alt;
                        }}
                        alt={"image"}/>
                    <span>


                    <p className={styles.model}>
                        {car.for_rent && <span className={styles.forRent}>ქირავდება</span>}
                        {man?.man_name} {" "}
                        <span style={{marginRight: 5}}>{model?.model_name} </span>
                        <span className={styles.year}>{car.prod_year} წ</span>
                    </p>
                    </span>

                    <div className={styles.info}>
                        <span className={styles.engine}>
                            <Engine width={16} height={16} className={styles.icon}/>
                            <span className={styles.engineText}>
                                {parseFloat((car.engine_volume / 1000) + "").toFixed(1)} {" "}
                                {fuelTypes.find(t => t.id === car.fuel_type_id)!.type}
                            </span>
                        </span>

                        <span className={styles.clutch}>
                            <Shifter width={16} height={16} className={styles.icon}/>
                            <span className={styles.clutchText}>
                                {gearTypes.find(t => t.id === car.gear_type_id)!.type}
                            </span>
                        </span>

                        <span className={styles.miles}>
                            <Speed width={16} height={16} className={styles.icon}/>
                            <span className={styles.speedText}>
                                {car.car_run_km} კმ
                            </span>
                        </span>

                        <span className={styles.steering}>
                            <Steering width={16} height={16} className={styles.icon}/>
                            <span className={styles.steeringText}>
                                {width.width > 800 ? (car.right_wheel ? "მარჯვენა" : "მარცხენა")
                                    : ((car.right_wheel ? "საჭე მარჯვნივ" : "საჭე მარცხნივ"))}
                            </span>
                        </span>
                    </div>

                    {width.width <= 800 && <div style={{marginBottom: 30}}></div>}
                    {width.width <= 800 && <div className={styles.border}></div>}
                    <div className={styles.stats}>
                        <p>
                            {width.width <= 800 && <span className={styles.hot}><Hot/></span>}
                            <span className={styles.views}>{car.views} ნახვა</span>
                            <span className={styles.dot}></span>
                            <span>{getNormalizedDate(car.order_date)}</span>
                        </p>
                    </div>

                    {car.customs_passed ?
                        (
                            <span className={styles.taxed}><Done/> განბაჟებული</span>
                        )
                        :
                        <span className={styles.notTaxed}>განუბაჟებელი</span>
                    }
                    <span className={styles.bottomIcons}>
                        <BottomIcons/>
                    </span>

                    <span className={styles.price}>
                            {!showUSD ? car.price_value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                : Math.round(car.price_usd).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        <span className={styles.priceToggle} onClick={() => setShowUSD(prevState => !prevState)}>
                            {" "}
                            <span style={showUSD ? {
                                ...currencyStyles,
                                backgroundColor: "#F2F3F6"
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
                </React.Fragment>
            )}
        </div>
    )
})