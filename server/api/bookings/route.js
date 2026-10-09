import { NextResponse } from "next/server";
import clientPromise from "../../config/mongodb.js";
import { Booking } from "../../models/Booking.js";
import jwt from "jsonwebtoken";

function verifyToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET || "demo-secret");
}

export async function GET(request) {
  try {
    const decoded = verifyToken(request);
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType") || "customer";

    const client = await clientPromise;
    const db = client.db("servicefinder");

    const bookings = await Booking.findByUser(db, decoded.userId, userType);

    // Enrich bookings with professional/customer information
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          if (userType === "customer") {
            // For customers, get professional info
            const { User } = await import("../../models/User.js");
            console.log(db);

            const professional = await User.findById(
              db,
              booking.professionalId,
            );

            return {
              ...booking,
              professionalName: professional?.name || "Unknown Professional",
              professionalPhone: professional?.phone || "N/A",
              professionalEmail: professional?.email || "N/A",
              professionalRating: professional?.rating || 0,
            };
          } else {
            // For professionals, get customer info
            const { User } = await import("../../models/User.js");
            const customer = await User.findById(db, booking.customerId);
            return {
              ...booking,
              customerName: customer?.name || "Unknown Customer",
              customerPhone: customer?.phone || "N/A",
              customerEmail: customer?.email || "N/A",
            };
          }
        } catch (error) {
          console.error("Error enriching booking data:", booking._id, error);
          return booking;
        }
      }),
    );

    return NextResponse.json({
      success: true,
      bookings: enrichedBookings,
    });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    const decoded = verifyToken(request);
    const bookingData = await request.json();

    const client = await clientPromise;
    const db = client.db("servicefinder");

    const booking = await Booking.create(db, {
      ...bookingData,
      customerId: decoded.userId,
    });

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
