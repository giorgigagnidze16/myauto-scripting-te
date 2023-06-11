import {ICar, ICarModel, ICategory, IManufacturer} from "./model";
import axios from "axios";


export class InfoController {
    async fetchManufacturers(): Promise<IManufacturer[]> {
        const response = await axios.get<IManufacturer[]>('https://static.my.ge/myauto/js/mans.json')
        return response.data
    }

    async fetchModelsByManufacturerId(manId: string): Promise<ICarModel[]> {
        const response = await axios.get<any>(`https://api2.myauto.ge/ka/getManModels?man_id=${manId}`)
        return response.data.data
    }

    async fetchCategories(): Promise<ICategory[]> {
        const response = await axios.get<any>('https://api2.myauto.ge/ka/cats/get')
        return response.data.data
    }

    async fetchProducts(): Promise<ICar[]> {
        const response = await axios.get<any>('https://api2.myauto.ge/ka/products/')

        return response.data.data.items
    }

    async fetchProductsFromUrl(query: string, page: number): Promise<{items: ICar[], meta: number}> {
        const response = await axios.get<any>(`https://api2.myauto.ge/ka/products?${query}&Page=${page}`)
        return { items: response.data.data.items, meta: response.data.data.meta.total}
    }

    async fetchMeta(): Promise<number> {
        const response = await axios.get<any>('https://api2.myauto.ge/ka/products/')

        return response.data.data.meta.total
    }
}