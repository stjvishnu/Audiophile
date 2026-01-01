import mongoose from 'mongoose'
import Offer from '../../models/offerModel.js'
import Products from '../../models/productModel.js' 
import Category from '../../models/categoryModel.js'
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../../utils/constants.js'




/**
 * @desc Get all offers for admin view with pagination
 * @route GET /admin/offers
 */
const getOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOffers = await Offer.countDocuments();
    const totalPages = Math.ceil(totalOffers / limit)

    // Populate target details (e.g., category name or product name)
    const offers = await Offer.find()
      .populate('targetId') // Assuming targetId can be populated to get the name
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Map offers to rename targetId field to 'target' object with a 'name' property
    const offersWithTargetName = offers.map(offer => {
      const targetName = offer.targetId ? offer.targetId.name || offer.targetId.title : 'N/A';
      return {
        ...offer.toObject(),
        target: {
          id: offer.targetId ? offer.targetId._id : null,
          name: targetName
        }
      };
    });

    res.render('admin/offers.ejs', {
      layout: "layouts/admin-dashboard-layout",
      pageTitle: "Offers",
      offers: offersWithTargetName,
      currentPage: page,
      totalPages: totalPages
    })
  } catch (error) {
    console.log("Error in get offers controller", error);
    // Optionally render an error page or redirect
  }
}



const addOffer = async (req, res) => {
  console.log('Call received in addOffer controller');
  try {
    const { offerTitle, description, offerType, targetId,discountType, discountValue, validFrom, validTo, isActive } = req.body;

    console.log('req.body',req.body);

    let targetName=null;
    if(offerType=='product'){
      const productFound = await Products.findOne({'variants.sku':targetId},{name:1,brand:1,category:1,productDetails:1,variants:{$elemMatch:{sku:targetId}}})
      targetName = `${productFound.name} (${productFound.variants[0].attributes.color})`
    }else if(offerType=='category'){
      const categoryFound=await Category.findOne({_id:targetId})
      targetName = categoryFound.name
    }

    




    // --- Validation ---

    // 1. Mandatory Fields
    if (!offerTitle || !description || !offerType || !discountType || !discountValue || !validFrom || !validTo) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Required fields missing.' })
    }

    // 2. Offer Type and Target ID validation
    if (offerType !== 'festival') {
      if (!targetId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Target is required for Product/Category offers.' })
      }
      
    }

    // 3. Date Validation
    if (new Date(validTo) <= new Date(validFrom)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Expiry date must be AFTER start date.' })
    }

    // 4. Discount Value Validation
    const numericDiscountValue = Number(discountValue);
    console.log('numericdiscountvalue',numericDiscountValue);
    if (isNaN(numericDiscountValue) || numericDiscountValue <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Discount value must be a positive number.' })
    }
    if (discountType === 'percentage' && (numericDiscountValue > 90 || numericDiscountValue < 1)) {
       return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Percentage discount must be between 1 and 90.' })
    }

    // 5. Title/Description Length
    if (offerTitle.trim().length < 3 || offerTitle.trim().length > 40) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Title must be 3-40 characters.' })
    }
    if (description.trim().length < 5 || description.trim().length > 300) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Description must be 5-300 characters.' })
    }
    console.log('hello');
    // 6. Check for duplicate offers (e.g., a specific product already having an active offer)
    if (offerType !== 'festival') {
      if(offerType =='product'){
        const existingOffer = await Offer.findOne({ offerType, targetSku:targetId, isDelete: false, validTo: { $gt: new Date() } });
        if (existingOffer) {
          return res.status(HTTP_STATUS.CONFLICT).json({ message: RESPONSE_MESSAGES.CONFLICT, customMessage: `An active ${offerType} offer already exists for this target.` })
        }
      }else if (offerType =='category'){
        const existingOffer = await Offer.findOne({ offerType, targetId, isDelete: false, validTo: { $gt: new Date() } });
        if (existingOffer) {
          return res.status(HTTP_STATUS.CONFLICT).json({ message: RESPONSE_MESSAGES.CONFLICT, customMessage: `An active ${offerType} offer already exists for this target.` })
        }
      
    }
  }
  console.log('hiii');


    const offerData = {
      offerTitle,
      description,
      offerType,
      discountType,
      discountValue: numericDiscountValue,
      validFrom,
      validTo,
      isActive,
      targetName

    }

    if(offerType=='product') offerData.targetSku=targetId
    else if(offerType=='category') offerData.targetId=targetId
    else offerData.targetId=null;

    console.log('offerData',offerData);

    const newOffer = await Offer.create(offerData)

    if (!newOffer) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, customMessage: 'Request failed, try again later' })
    }

    res.status(HTTP_STATUS.CREATED).json({ message: RESPONSE_MESSAGES.CREATED, customMessage: 'Offer added successfully', offer: newOffer })

  } catch (error) {
    console.log('Error in add offer controller', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, customMessage: 'An unexpected error occurred' })
  }
}


/**
 * @desc Edit an existing offer
 * @route PUT /admin/offers/:editId
 */
const editOffer = async (req, res) => {
  console.log('call inside edit');
  try {
    const offerId = req.params.editId;
    const { offerTitle, description, offerType, targetId,discountType, discountValue, validFrom, validTo, isActive } = req.body;

    // --- Validation ---

    // 1. Mandatory Fields
    if (!offerTitle || !description || !offerType || !discountType || !discountValue || !validFrom || !validTo) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Required fields missing.' })
    }

    // 2. Offer Type and Target ID validation
    if (offerType !== 'festival') {
      if (!targetId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Target is required for Product/Category offers.' })
      }
      
    }

    // 3. Date Validation
    if (new Date(validTo) <= new Date(validFrom)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Expiry date must be AFTER start date.' })
    }

    // 4. Discount Value Validation
    const numericDiscountValue = Number(discountValue);
    console.log('numericdiscountvalue',numericDiscountValue);
    if (isNaN(numericDiscountValue) || numericDiscountValue <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Discount value must be a positive number.' })
    }
    if (discountType === 'percentage' && (numericDiscountValue > 90 || numericDiscountValue < 1)) {
       return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Percentage discount must be between 1 and 90.' })
    }

    // 5. Title/Description Length
    if (offerTitle.trim().length < 3 || offerTitle.trim().length > 40) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Title must be 3-40 characters.' })
    }
    if (description.trim().length < 5 || description.trim().length > 300) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Description must be 5-300 characters.' })
    }
    console.log('hello');
    // 6. Check for duplicate offers (e.g., a specific product already having an active offer)
    if (offerType !== 'festival') {
      if(offerType =='product'){
        const existingOffer = await Offer.findOne({ offerType, targetSku:targetId, isDelete: false, validTo: { $gt: new Date() } });
        if (existingOffer) {
          return res.status(HTTP_STATUS.CONFLICT).json({ message: RESPONSE_MESSAGES.CONFLICT, customMessage: `An active ${offerType} offer already exists for this target.` })
        }
      }else if (offerType =='category'){
        const existingOffer = await Offer.findOne({ offerType, targetId, isDelete: false, validTo: { $gt: new Date() } });
        if (existingOffer) {
          return res.status(HTTP_STATUS.CONFLICT).json({ message: RESPONSE_MESSAGES.CONFLICT, customMessage: `An active ${offerType} offer already exists for this target.` })
        }
      
    }
  }

  let targetName=null;
  if(offerType=='product'){
    const productFound = await Products.findOne({'variants.sku':targetId},{name:1,brand:1,category:1,productDetails:1,variants:{$elemMatch:{sku:targetId}}})
    console.log('product found',productFound);
    targetName = `${productFound.name} (${productFound.variants[0].attributes.color})`
  }else if(offerType=='category'){
    const categoryFound=await Category.findOne({_id:targetId})
    targetName = categoryFound.name
  }


    // --- Update Offer ---

    const updateFields = {
      offerTitle,
      description,
      offerType,
      discountType,
      discountValue: numericDiscountValue,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      isActive,
      targetName
    }

    if(offerType=='product') updateFields.targetSku=targetId
    else if(offerType=='category') updateFields.targetId=targetId
    else updateFields.targetId=null;

    const updatedOffer = await Offer.findOneAndUpdate({ _id: offerId }, updateFields, { new: true });

    if (!updatedOffer) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: RESPONSE_MESSAGES.NOT_FOUND, customMessage: 'Offer not found or update failed.' })
    }

    res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.OK, customMessage: 'Offer edited successfully', updatedOffer })


  } catch (error) {
    console.log('Error in edit offer controller', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, customMessage: 'Request failed, try again later' })
  }
}


/**
 * @desc Block an offer (set isActive to false)
 * @route PATCH /admin/offers/block/:offerId
 */
const blockOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const updatedOffer = await Offer.findOneAndUpdate({ _id: offerId }, { isActive: false })
    if (!updatedOffer) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Request Failed, try again later !' })
    res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.OK, customMessage: 'Offer blocked successfully' })
  } catch (error) {
    console.log('Block Offer error', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, customMessage: "Error in Blocking Offer" })
  }
}


/**
 * @desc Unblock an offer (set isActive to true)
 * @route PATCH /admin/offers/unblock/:offerId
 */
const unblockOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const updatedOffer = await Offer.findOneAndUpdate({ _id: offerId }, { isActive: true })
    if (!updatedOffer) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Request Failed, try again later !' })
    res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.OK, customMessage: 'Offer unblocked successfully', updatedOffer })
  } catch (error) {
    console.log('Unblock Offer error', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, customMessage: "Error in unblocking offer" })
  }
}


/**
 * @desc Soft delete an offer (set isDelete to true)
 * @route DELETE /admin/offers/:offerId
 */
const deleteOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const updatedOffer = await Offer.findOneAndUpdate({ _id: offerId }, { isDelete: true })
    if (!updatedOffer) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Request Failed, try again later !' })
    res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.OK, customMessage: 'Offer deleted successfully', updatedOffer })
  } catch (error) {
    console.log('Delete Offer error', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, customMessage: "Error in deleting Offer" })
  }
}


/**
 * @desc Restore a soft-deleted offer (set isDelete to false)
 * @route PATCH /admin/offers/restore/:offerId
 */
const restoreOffer = async (req, res) => {
  try {
    const offerId = req.params.offerId;
    const updatedOffer = await Offer.findOneAndUpdate({ _id: offerId }, { isDelete: false }, {new: true}) // Use {new: true} to get the updated document
    if (!updatedOffer) return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: RESPONSE_MESSAGES.BAD_REQUEST, customMessage: 'Request Failed, try again later !' })
    res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.OK, customMessage: 'Offer restored successfully', updatedOffer })
  } catch (error) {
    console.log('Restore Offer error', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, customMessage: "Error in restoring offer" })
  }
}

const getTargets = async (req,res) =>{
  console.log('call inside get targets');
  try {
    const categories =  await Category.find({isActive:true,isDeleted:false});
    const products = await Products.aggregate([{$match:{isActive:true,isDeleted:false}},{$addFields:{variants:{$filter:{input:"$variants",as:'variant',cond:{$and:[{$eq:['$$variant.attributes.isActive',true]},{$ne:['$$variant.attributes.isDeleted',true]}]}}}}},{$project:{name:1,brand:1,variants:1}}])
    const targets={categories,products}

    res.status(HTTP_STATUS.OK).json({message:RESPONSE_MESSAGES.OK,targets})
    console.log('products',products);
  } catch (error) {
    console.log('error in get targets',error);
  }
}


export default {
  getOffers,
  addOffer,
  editOffer,
  blockOffer,
  unblockOffer,
  deleteOffer,
  restoreOffer,
  getTargets
}