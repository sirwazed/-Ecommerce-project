const config = require('../config.json');
const jwt = require('jsonwebtoken');
const Role = require('_helpers/role');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const fs = require('fs');
const res = require('express/lib/response');
const Product = db.Product;
const Cart = db.Cart;

module.exports = {
    getAll,
    getByCategory,
    getByCode,
    create,
    update,
    delete: _delete
};

serverUrl = config.url;

async function getAll(req) {
    if (req.params.id == 0) {
        return await Product.find();
    }
    else {
        //console.log("yes");
        let num = parseInt(req.params.id);
        return await Product.find().skip((num - 1) * 10).limit(10);
    }
}

async function getByCode(id) {
    //console.log(id);
    return await Product.find({ productShortCode: id });
}

async function getByCategory(id) {
    //console.log(id);
    return await Product.find({ category: id });
}


async function create(userParam) {
    // validate
    if (await Product.findOne({ productShortCode: userParam.productShortCode })) {
        throw 'productShortCode "' + userParam.productShortCode + '" is already taken';
    }

    const product = new Product(userParam);

    await product.save();
}

async function update(id, userParam) {
    const product = await Product.findById(id);
    let productSub = product.imageUrl.substring(0, 8);
    if (productSub === 'uploads/') {
        let filePath = product.imageUrl;
        fs.stat(filePath, function (err, stats) {
            if (err) {
                return console.error(err);
            }
            fs.unlinkSync(filePath);
        })
    }
    if (product.productShortCode !== userParam.productShortCode) {
        await Cart.updateMany({ productShortCode: product.productShortCode }, { $set: { productShortCode: userParam.productShortCode } });
    }
    Object.assign(product, userParam);
    await product.save();
}

async function _delete(id) {
    let product = await Product.findById(id);
    //console.log('yes');
    let cart = await Cart.find({ productShortCode: product.productShortCode });
    if (cart.length) {
        //console.log('yes 2');
        return { message: 'Product was not deleted. Exists on cart.' };
    }
    else {
        let productSub = product.imageUrl.substring(0, 8);
        if (productSub === 'uploads/') {
            await Product.findByIdAndRemove(id);
            //console.log('yes');
            let filePath = product.imageUrl;
            // //console.log(filePath);
            // fs.unlinkSync(filePath);
            fs.stat(filePath, function (err, stats) {
                if (err) {
                    return console.error(err);
                }
                fs.unlinkSync(filePath);
            })
        }
        else {
            await Product.findByIdAndRemove(id);
        }
        return { message: 'Product deleted successfully' };
    }


    //console.log('Got it 2');
    //await Product.findByIdAndRemove(id);
}