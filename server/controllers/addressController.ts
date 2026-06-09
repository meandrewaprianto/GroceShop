// Get User addresses
// GET /api/addresses

import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const getAddresses = async (req: Request, res: Response) => {
    const addresses = await prisma.address.findMany({
        where: { userId: req.user?.id },
        orderBy: { createdAt: "asc" }
    })
    res.json({ addresses })
}

// Add Address
// POST /api/addresses
export const addAddress = async (req: Request, res: Response) => {
    const { label, address, city, state, zip, isDefault, lat, lng } = req.body;

    // Require Street Address and State
    if (!address || !address.trim()) {
        return res.status(400).json({ message: "Nama jalan (street address) wajib diisi." });
    }
    if (!state || !state.trim()) {
        return res.status(400).json({ message: "Provinsi (state) wajib diisi." });
    }

    // Require Coordinates
    if (lat == null || lng == null || Number(lat) === 0 || Number(lng) === 0) {
        return res.status(400).json({ message: "Koordinat lokasi tidak valid. Mohon pilih alamat dari rekomendasi atau gunakan deteksi GPS." });
    }

    const currentAddresses = await prisma.address.findMany({
        where: { userId: req.user?.id }
    })

    let makeDefault = isDefault;
    if (currentAddresses.length === 0) makeDefault = true

    if (makeDefault) {
        await prisma.address.updateMany({
            where: { userId: req.user?.id },
            data: { isDefault: false }
        })
    }

    await prisma.address.create({
        data: {
            userId: req.user!.id,
            label,
            address,
            city,
            state,
            zip,
            isDefault: makeDefault,
            lat: Number(lat),
            lng: Number(lng)
        }
    })

    const addresses = await prisma.address.findMany({
        where: { userId: req.user?.id },
        orderBy: { createdAt: "asc" }
    })
    res.status(201).json({ addresses })
}

// Update address
// PUT /api/addresses/:id
export const updateAddress = async (req: Request, res: Response) => {
    const { label, address, city, state, zip, isDefault, lat, lng } = req.body;

    // Require Street Address and State
    if (!address || !address.trim()) {
        return res.status(400).json({ message: "Nama jalan (street address) wajib diisi." });
    }
    if (!state || !state.trim()) {
        return res.status(400).json({ message: "Provinsi (state) wajib diisi." });
    }

    // Require Coordinates
    if (lat == null || lng == null || Number(lat) === 0 || Number(lng) === 0) {
        return res.status(400).json({ message: "Koordinat lokasi tidak valid. Mohon pilih alamat dari rekomendasi atau gunakan deteksi GPS." });
    }

    if (isDefault) {
        await prisma.address.updateMany({
            where: { userId: req.user?.id },
            data: { isDefault: false }
        })
    }

    const data: any = {}
    if (label) data.label = label;
    if (address) data.address = address;
    if (city) data.city = city;
    if (state) data.state = state;
    if (zip) data.zip = zip;
    if (isDefault != "undefined") data.isDefault = isDefault;
    if (lat != null) data.lat = Number(lat);
    if (lng != null) data.lng = Number(lng);

    try {
        await prisma.address.update({
            where: { id: req.params.id as string },
            data,
        })
    } catch (error) {
        return res.status(404).json({ message: "Address not found" })
    }

    const addresses = await prisma.address.findMany({
        where: { userId: req.user?.id },
        orderBy: { createdAt: "asc" }
    })

    res.json({ addresses })
}

// Delete address
// DELETE /api/addresses/:id
export const deleteAddress = async (req: Request, res: Response) => {
    try {
        await prisma.address.delete({ where: { id: req.params.id as string } })
    } catch (err: any) {
        console.log(err.message)
    }

    const addresses = await prisma.address.findMany({
        where: { userId: req.user?.id },
        orderBy: { createdAt: "asc" }
    })

    res.json({ addresses })
}

