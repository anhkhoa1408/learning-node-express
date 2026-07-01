import type { NextFunction, Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { OK, SuccessResponse } from "../core/success.response";
import ProductService from "../services/product.strategy.service";
import { requireAuthContext } from "../types/guards";
import type { ProductType } from "../types/domain";

interface IdParams extends ParamsDictionary {
  id: string;
}

interface SearchParams extends ParamsDictionary {
  key: string;
}

interface ProductBody {
  productType: ProductType;
  [key: string]: unknown;
}

const getQueryString = (value: unknown, fallback: string): string => (typeof value === "string" ? value : fallback);

class ProductController {
  createProduct = async (req: Request, res: Response, _next: NextFunction) => {
    const { user } = requireAuthContext(req);
    const body = req.body as ProductBody;
    return new SuccessResponse({
      message: "Create product successfully!",
      metadata: await ProductService.createProduct(body.productType, {
        ...body,
        productShop: user.userId,
      }),
    }).send(res);
  };

  getAllDraftsForShop = async (req: Request, res: Response, _next: NextFunction) => {
    const { user } = requireAuthContext(req);
    return new SuccessResponse({
      message: "Get list draft products successfully!",
      metadata: await ProductService.findAllDraftsForShop({
        productShop: user.userId,
        limit: 50,
        skip: 0,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (req: Request, res: Response, _next: NextFunction) => {
    const { user } = requireAuthContext(req);
    return new SuccessResponse({
      message: "Get list published products successfully!",
      metadata: await ProductService.findAllPublishForShop({
        productShop: user.userId,
        limit: 50,
        skip: 0,
      }),
    }).send(res);
  };

  findAllProducts = async (req: Request, res: Response, _next: NextFunction) =>
    new SuccessResponse({
      message: "Get list products successfully!",
      metadata: await ProductService.findAllProducts({
        limit: Number(req.query.limit ?? 50),
        page: Number(req.query.page ?? 1),
        sort: getQueryString(req.query.sort, "ctime"),
      }),
    }).send(res);

  findProduct = async (req: Request<IdParams>, res: Response, _next: NextFunction) =>
    new SuccessResponse({
      message: "Get product successfully!",
      metadata: await ProductService.findProduct({
        productId: req.params.id,
      }),
    }).send(res);

  publishProductByShop = async (req: Request<IdParams>, res: Response, _next: NextFunction) => {
    const { user } = requireAuthContext(req);
    return new SuccessResponse({
      message: "Publish product for shop successfully|",
      metadata: await ProductService.publishProductByShop({
        productShop: user.userId,
        productId: req.params.id,
      }),
    }).send(res);
  };

  unPublishProductByShop = async (req: Request<IdParams>, res: Response, _next: NextFunction) => {
    const { user } = requireAuthContext(req);
    return new SuccessResponse({
      message: "Unpublish product for shop successfully|",
      metadata: await ProductService.unPublishProductByShop({
        productShop: user.userId,
        productId: req.params.id,
      }),
    }).send(res);
  };

  searchProductsByUser = async (req: Request<SearchParams>, res: Response, _next: NextFunction) =>
    new OK({
      message: "Success",
      metadata: await ProductService.searchProductByUser({
        keySearch: req.params.key,
      }),
    }).send(res);

  updateProduct = async (req: Request<IdParams>, res: Response, _next: NextFunction) => {
    const { user } = requireAuthContext(req);
    const body = req.body as ProductBody;
    return new OK({
      message: "Update product successfully",
      metadata: await ProductService.updateProduct(body.productType, req.params.id, {
        ...body,
        productShop: user.userId,
      }),
    }).send(res);
  };
}

export default new ProductController();
