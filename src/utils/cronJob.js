import cron from "node-cron";
import Offer from "../models/offerModel.js";
import Coupon from "../models/couponModel.js";

const startOfferCouponCron = () => {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    try {
      /* =========================
         OFFERS
      ========================= */

      // Activate valid offers
      await Offer.updateMany(
        {
          validFrom: { $lte: now },
          validTo: { $gte: now },
          isDelete: false
        },
        { $set: { isActive: true } }
      );

      // Deactivate expired or future offers
      await Offer.updateMany(
        {
          $or: [
            { validTo: { $lt: now } },
            { validFrom: { $gt: now } },
            { isDelete: true }
          ]
        },
        { $set: { isActive: false } }
      );

      /* =========================
         COUPONS
      ========================= */

      // Activate valid coupons
      await Coupon.updateMany(
        {
          validFrom: { $lte: now },
          validTo: { $gte: now },
          isDelete: false
        },
        { $set: { isActive: true } }
      );

      // Deactivate expired or future coupons
      await Coupon.updateMany(
        {
          $or: [
            { validTo: { $lt: now } },
            { validFrom: { $gt: now } },
            { isDelete: true }
          ]
        },
        { $set: { isActive: false } }
      );

    } catch (err) {
      console.error("Offer/Coupon cron error:", err);
    }
  });
};

export default startOfferCouponCron;
