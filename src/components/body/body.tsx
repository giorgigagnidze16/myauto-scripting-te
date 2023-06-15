import {Card} from "./card";
import React, {useCallback, useEffect, useState} from "react";
import {ICar, ICarModel, ICategory, IManufacturer} from "../../api/model";
import {InfoController} from "../../api/fetchs";
import styles from "../styles/body.module.css";
import {Filter, saleOptions} from "./filter";
import {ReactComponent as ArrowDown} from "../styles/imgs/arr-down.svg";
import loader from "../styles/imgs/loader.gif";
import {useWindowSize} from "@uidotdev/usehooks";

export const api = new InfoController();

const timePeriod =
    [
        "1 საათი",
        "3 საათი",
        "6 საათი",
        "12 საათი",
        "24 საათი",
    ];

const sortOrderArray: any[] = [
    "თარიღი კლებადი",
    "თარიღი ზრდადი",
    "ფასი კლებადი",
    "ფასი ზრდადი",
    "გარბენი კლებადი",
    "გარბენი ზრდადი",
];

function mapOrder(order: string) {
    switch (order) {
        case "თარიღი კლებადი":
            return 1
        case "თარიღი ზრდადი":
            return 2
        case "ფასი კლებადი":
            return 3
        case "ფასი ზრდადი":
            return 4
        case "გარბენი კლებადი":
            return 5
        case "გარბენი ზრდადი":
            return 6
        default:
            throw new Error("No such case");
    }
}

export const Body = ({nav}: { nav: boolean }) => {
    const [products, setProducts] = useState<ICar[]>([])
    const [fetchedModels, setFetchedModels] = useState<ICarModel[]>([])
    const [manufacturers, setManufacturers] = useState<IManufacturer[]>([])
    const [cats, setCats] = useState<ICategory[]>([])
    const [showUSD, setShowUSD] = useState(false)
    const [total, setTotal] = useState(0)
    const [sortTime, setSortTime] = useState<string>("")
    const [sortOrder, setOrder] = useState<string>(sortOrderArray[0]);
    const [periodQuery, setPeriodQuery] = useState<string[]>([]);
    const [index, setIndex] = useState(1);
    const [filter, setFilter] = useState("");
    const width = useWindowSize()

    useEffect(() => {
        Promise.all([
            api.fetchProducts(),
            api.fetchManufacturers(),
            api.fetchMeta(),
            api.fetchCategories(),
        ])
            .then(([cars, manufacturers, total, categories]) => {
                setProducts(cars);
                setManufacturers(manufacturers);
                setTotal(total);
                setCats(categories);


                const modelsJson = localStorage.getItem("models");

                if (modelsJson !== null && JSON.parse(modelsJson).length > 0) {
                    const parsed = JSON.parse(modelsJson).flatMap((x: any) => x) as ICarModel[];
                    const data: ICarModel[] = [];
                    for (const car of cars) {
                        data.push(...(parsed.filter((x: ICarModel) => x.man_id === car.man_id)))
                    }
                    setFetchedModels(data)
                } else {
                    const fetchPromise = [];
                    for (const car of cars) {
                        fetchPromise.push(api.fetchModelsByManufacturerId(car.man_id + ""))
                    }

                    Promise.all(fetchPromise).then(([mod]) => {
                        setFetchedModels(mod)
                    })
                }
            })
            .catch((err) => alert(JSON.stringify(err)));
    }, []);

    useEffect(() => {
        const modelsJson = localStorage.getItem("models");

        if (modelsJson == null) {
            const fetchData = async () => {
                const prom = [];
                for (const manufact of manufacturers) {
                    prom.push(api.fetchModelsByManufacturerId(manufact.man_id));
                }

                Promise.all(prom).then(x => {
                    if (x) {
                        localStorage.setItem("models", JSON.stringify(x));
                    }
                }).catch(err => JSON.stringify(err));

            };

            fetchData();
            const intervalId = setInterval(fetchData, 15 * 60 * 1000);

            return () => {
                clearInterval(intervalId);
                localStorage.removeItem("models");
            };
        }
    }, [manufacturers]);

    useEffect(() => {
        if (sortTime.length !== 0) {
            setPeriodQuery(prev => [...(prev.filter(x => !x.includes("Period"))), "Period=" + sortTime.split(" ")[0] + 'h'])
        }
    }, [sortTime])


    useEffect(() => {
        setPeriodQuery(prev => [...(prev.filter(x => !x.includes("SortOrder"))), `SortOrder=${mapOrder(sortOrder)}`])
    }, [sortOrder])

    useEffect(() => {
        if (periodQuery.length !== 0) {
            api.fetchProductsFromUrl(periodQuery.join("&") + "&" + filter, index).then(cars => {
                setProducts(cars.items)
                setTotal(cars.meta)
            }).catch(err => alert(JSON.stringify(err)))
        }
    }, [filter, index, periodQuery])


    const handleSearch = useCallback(({filterQuery}: { filterQuery: string }) => {
        api.fetchProductsFromUrl(periodQuery.join("&") + "&" + filterQuery, index).then(cars => {
            setProducts(cars.items)
            setTotal(cars.meta)
        }).catch(err => alert(JSON.stringify(err)))
    }, [index, periodQuery])

    const handleNext = useCallback(() => {
        if (index + 1 <= total / 15) {
            setIndex(prevState => prevState + 1)
        }
    }, [index, total])

    const handlePrev = useCallback(() => {
        if (index - 1 > 0) {
            setIndex(prevState => prevState - 1)
        }
    }, [index])

    return (
        <div className={styles.root}>
            <div className={styles.filterWrap}>
                <Filter showUSD={showUSD} setShowUSD={setShowUSD} mans={manufacturers} cats={cats}
                        handleSearch={handleSearch} setFilter={setFilter}/>
            </div>
            {nav && <Filter showUSD={showUSD} setShowUSD={setShowUSD} mans={manufacturers} cats={cats}
                            handleSearch={handleSearch} setFilter={setFilter}/>}
            {products && manufacturers && cats && manufacturers.length > 0 && fetchedModels.length > 0 ? (
                <React.Fragment>
                    <div className={styles.cardHolder}>
               <span className={styles.totalMeta}>
                  {width.width > 700 && `${total} განცხადება`}
               </span>
                        <div className={styles.dropdownWrap}>
                            <Dropdown title={sortOrderArray[0]} width={180} height={30} items={sortOrderArray}
                                      item={sortOrder} setItem={setOrder}
                                      style={{marginRight: 10, fontSize: 14, fontWeight: "600 !important"}}/>

                            <Dropdown title={"პერიოდი"} width={140} height={30} items={timePeriod}
                                      item={sortTime} setItem={setSortTime}
                                      style={{fontSize: 14, fontWeight: "600 !important"}}/>
                        </div>
                        <br/>
                        {products
                            .map((car, index) =>
                                (<Card car={car} key={index} models={fetchedModels} mans={manufacturers}
                                       showUSD={showUSD}
                                       setShowUSD={setShowUSD}/>))
                        }

                        <div className={styles.pagin}>
                            <button className={styles.next} onClick={handlePrev}>უკან</button>
                            <span style={{marginRight: 20}}> </span>
                            <button className={styles.next} style={width.width <= 700 ? {float: "right"} : {}}
                                    onClick={handleNext}>წინ
                            </button>
                        </div>
                    </div>

                </React.Fragment>) : <img src={loader} alt={"load"} className={styles.loader}/>}
        </div>
    )
}


export const Dropdown = React.memo(({title, width, items, height, setItem, item, style}: {
    title: string, width?: number,
    setItem: React.Dispatch<React.SetStateAction<any>>, item: any, items: any[], height?: number,
    style?: any
}) => {
    const [showDropdown, setDropdown] = useState(false);

    const handleClick = useCallback((index: number) => {
        setItem(items[index]);
    }, [items, setItem]);

    return (
        <div className={styles.dropdown} onClick={useCallback(() => setDropdown(prevState => !prevState), [])}
             style={{width, ...style}}>
            <p className={styles.dropdown_pholder}>
                {item || title}
            </p>

            <span className={styles.arrowDown}>
                <ArrowDown/>
            </span>

            {showDropdown &&
                (
                    <div className={styles.menu} style={{width}}>
                        {items.map((item, index) =>
                            <span key={index}
                                  className={styles.menutext}
                                  style={{height}}
                                  onClick={() => handleClick(index)}
                            >
                                {`${item}`}
                            </span>)
                        }
                    </div>
                )
            }
        </div>
    )
});

export const DropdownWithCheckbox = React.memo(({title, width, items, height, setItem, val, style}: {
    title: string, width?: number,
    setItem: React.Dispatch<React.SetStateAction<any | any[]>>, val: any, items: string[], height?: number,
    style?: any,
}) => {
    const [showDropdown, setDropdown] = useState(false);

    const handleClick = useCallback((index: number) => {
        if ((typeof val === "string" && items.length === 0) || saleOptions.includes(items[index])) {
            setItem(items[index]);
        } else {
            setItem((prev: string[]) => {
                if (prev.includes(items[index])) {
                    return prev.filter(x => x !== items[index] + "");
                }
                return [...prev, items[index]];
            });
        }
    }, [val, items]);

    const toggleDropdown = useCallback(() => setDropdown(prevState => !prevState), []);

    return (
        <div className={styles.dropdown} style={{width, ...style}}>
            {typeof val !== "string" ? (
                <span onClick={toggleDropdown} className={styles.cdroptitle}>
                    {val && val.length > 0 ? (`${val.join(",").substring(0, 21)}` + (val.length > 2 ? "..." : " ")) : title}
                </span>
            ) : (
                <span onClick={toggleDropdown} className={styles.cdroptitle}>
                    {val || title}
                </span>
            )}

            <span className={styles.arrowDown}>
                <ArrowDown/>
            </span>

            {showDropdown && (
                <div className={styles.menucbox} style={{width}}>
                    {items.map((item, index) =>
                        <span key={`${item}${index}`} onClick={() => handleClick(index)}
                              className={styles.checkbox}>
                            <input type={"checkbox"} key={`${item}${index}`}
                                   className={styles.menutextcheckbox}
                                   style={{height}} checked={val.includes(item)}/>
                            <p className={styles.checkboxitem}
                               style={item.length > 16 ? {height: 50} as any : {} as any}> {`${item}`}</p>
                        </span>
                    )}
                </div>
            )}
        </div>
    )
})


export const DropdownWithCheckboxWithObject = ({title, width, items, height, setItem, val, style}: {
    title: string, width?: number,
    setItem: React.Dispatch<React.SetStateAction<any | any[]>>, val: any, items: { label: string, value: string }[], height?: number,
    style?: any,
}) => {
    const [showDropdown, setDropdown] = useState(false);

    const handleClick = (index: number) => {
        if ((typeof val === "string" && items.length === 0)) {
            setItem(items[index]);
        } else {
            setItem((prev: any[]) => {
                if (prev.length > 0 && prev.find((t) => t.label === items[index].label)) {
                    return prev.filter(x => x.label !== items[index].label + "");
                }
                return [...prev, items[index]];
            });
        }
    }

    return (
        <div className={styles.dropdown} style={{width, ...style}}>

            {typeof val !== "string" ? (
                <span onClick={() => setDropdown(prevState => !prevState)} className={styles.cdroptitle}>
                {val && val.length > 0 ? (`${val.map((t: any) => t.label).join(",").substring(0, 21)}` + (val.length > 2 ? "..." : " ")) : title}
            </span>) : (<span onClick={() => setDropdown(prevState => !prevState)} className={styles.cdroptitle}>
                {val || title}
            </span>)}


            <span className={styles.arrowDown}>
                <ArrowDown/>
            </span>

            {showDropdown &&
                (
                    <div className={styles.menucbox} style={{width}}>
                        {items.map((item, index) =>
                            <span key={`${item}${index}`} onClick={() => handleClick(index)}
                                  className={styles.checkbox}>
                                <input type={"checkbox"} key={`${item}${index}`}
                                       className={styles.menutextcheckbox}
                                       style={{height}} checked={val.includes(item)}/>
                                <p className={styles.checkboxitem}
                                   style={item.value.length > 20 ? {height: 50} as any : {} as any}> {`${item.label}`}</p>
                                       </span>)
                        }
                    </div>
                )
            }
        </div>
    )
}