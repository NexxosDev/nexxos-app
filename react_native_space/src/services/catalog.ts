import api from './api';
import type { CatalogItem } from '../types';

export async function getStates(): Promise<CatalogItem[]> {
  const res = await api.get('/catalog/states');
  return res?.data?.items ?? [];
}

export async function getMunicipalities(stateId: string): Promise<CatalogItem[]> {
  const res = await api.get(`/catalog/municipalities?stateId=${encodeURIComponent(stateId)}`);
  return res?.data?.items ?? [];
}

export async function getParishes(municipalityId: string): Promise<CatalogItem[]> {
  const res = await api.get(`/catalog/parishes?municipalityId=${encodeURIComponent(municipalityId)}`);
  return res?.data?.items ?? [];
}

export async function getVehicleBrands(): Promise<CatalogItem[]> {
  const res = await api.get('/catalog/vehicle-brands');
  return res?.data?.items ?? [];
}

export async function getVehicleModels(brandId: string): Promise<CatalogItem[]> {
  const res = await api.get(`/catalog/vehicle-models?brandId=${encodeURIComponent(brandId)}`);
  return res?.data?.items ?? [];
}

export async function getPartCategories(): Promise<CatalogItem[]> {
  const res = await api.get('/catalog/part-categories');
  return res?.data?.items ?? [];
}

export async function getPartSubcategories(categoryId: string): Promise<CatalogItem[]> {
  const res = await api.get(`/catalog/part-subcategories?categoryId=${encodeURIComponent(categoryId)}`);
  return res?.data?.items ?? [];
}

export interface PartSearchResult {
  subcategoryId: string;
  subcategoryName: string;
  categoryId: string;
  categoryName: string;
}

export interface VinDecodeResult {
  success: boolean;
  vin: string;
  nhtsa: {
    make: string | null;
    model: string | null;
    year: string | null;
    engineModel: string | null;
    engineCylinders: string | null;
    displacementL: string | null;
    fuelType: string | null;
    bodyClass: string | null;
  };
  matched: {
    brandId: string | null;
    brandName: string | null;
    modelId: string | null;
    modelName: string | null;
  };
  message: string;
}

export async function decodeVin(vin: string): Promise<VinDecodeResult> {
  const res = await api.post('/vehicles/decode-vin', { vin });
  return res?.data ?? { success: false, vin, nhtsa: {}, matched: {}, message: 'Error desconocido' };
}

export async function searchParts(query: string): Promise<PartSearchResult[]> {
  const q = (query ?? '').trim();
  if (q.length < 2) return [];
  const res = await api.get(`/catalog/part-search?q=${encodeURIComponent(q)}`);
  return res?.data?.items ?? [];
}
